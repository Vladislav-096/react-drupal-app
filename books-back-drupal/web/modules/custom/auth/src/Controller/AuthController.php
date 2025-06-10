<?php

namespace Drupal\auth\Controller;

use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Drupal\Core\Controller\ControllerBase;
use Drupal\user\Entity\User;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

/**
 * Контроллер авторизации.
 */
class AuthController extends ControllerBase
{

  // private $jwt_key = 'your-very-secret-key'; // 👈 Замени на что-то посложнее в продакшене


  private function generateAccessToken($user)
  {
    $jwt_key = \Drupal::service('settings')->get('jwt_key');
    $payload = [
      'sub' => $user->id(),
      'email' => $user->getEmail(),
      'exp' => time() + 300, // 5 минут
    ];
    return JWT::encode($payload, $jwt_key, 'HS256');
  }

  private function generateRefreshToken($user)
  {
    $jwt_key = \Drupal::service('settings')->get('jwt_key');
    $payload = [
      'sub' => $user->id(),
      'username' => $user->getAccountName(),
      'email' => $user->getEmail(),
      'exp' => time() + 60 * 60 * 24 * 30, // 30 дней
    ];
    return JWT::encode($payload, $jwt_key, 'HS256');
  }

  public function register(Request $request)
  {
    // Логируем raw JSON из тела запроса
    \Drupal::logger('auth')->notice('RAW REQUEST: @data', [
      '@data' => $request->getContent(),
    ]);

    $data = json_decode($request->getContent(), TRUE);
    $username = $data['username'] ?? '';
    $email = $data['email'] ?? '';
    $password = $data['password'] ?? '';

    // Проверка на обязательные поля
    if (!$username || !$email || !$password) {
      return new JsonResponse(['error' => 'All fields (username, email, password) are required'], 400);
    }

    // Проверка email на валидность
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
      return new JsonResponse(['error' => 'Invalid email format'], 400);
    }

    // Проверка, что пользователь с таким именем уже есть
    if (user_load_by_name($username)) {
      return new JsonResponse(['error' => 'Username already exists'], 400);
    }

    $user = User::create([
      'name' => $username,
      'mail' => $email,
      'pass' => $password,
      'status' => 1,
    ]);
    $user->save();

    return new JsonResponse(['message' => 'User registered']);
  }

  // Обновлённый login() с установкой куки
  public function login(Request $request)
  {
    // $jwt_key = \Drupal::service('settings')->get('jwt_key');
    $data = json_decode($request->getContent(), TRUE);
    $username = $data['username'] ?? '';
    $password = $data['password'] ?? '';

    $user = user_load_by_name($username);
    if (!$user || !\Drupal::service('password')->check($password, $user->getPassword())) {
      return new JsonResponse(['error' => 'Invalid credentials'], 401);
    }

    // $payload = [
    //   'uid' => $user->id(),
    //   'username' => $user->getAccountName(),
    //   'mail' => $user->getEmail(),
    //   'exp' => time() + 3600,
    // ];
    // $jwt = JWT::encode($payload, $jwt_key, 'HS256');
    // $response = new JsonResponse(['message' => 'Login successful']);

    $accessToken = $this->generateAccessToken($user);
    $refreshToken = $this->generateRefreshToken($user);

    $response = new JsonResponse(['access_token' => $accessToken]);


    // Устанавливаем токен в HttpOnly куку
    $response->headers->setCookie(
      \Symfony\Component\HttpFoundation\Cookie::create(
        'refresh_token',  // имя куки
        $refreshToken,    // значение
        time() + 3600,    // истекает через час
        '/',              // путь
        null,             // домен
        false,            // secure (true — если только по HTTPS)
        true,             // httpOnly — нельзя прочитать JS-ом
        false,            // raw
        'Strict'          // SameSite
      )
    );

    return $response;
  }

  public function logout(): Response
  {
    $response = new JsonResponse(['message' => 'Logged out']);
    // $response->headers->clearCookie(
    //   'token',
    //   '/',           // путь — должен совпадать с путём установки куки
    //   null,          // домен — null по умолчанию
    //   false,         // secure
    //   true,          // httpOnly
    //   false,         // raw
    //   'Strict'       // sameSite (можно 'Lax' или 'None', зависит от случая)
    // );

    $response->headers->setCookie(
      \Symfony\Component\HttpFoundation\Cookie::create(
        'token',          // имя куки
        '',               // значение
        time() - 3600,    // прошедшее время = сразу истекает
        '/',              // путь
        null,             // домен
        false,            // secure (true — если только по HTTPS)
        true,             // httpOnly — нельзя прочитать JS-ом
        false,            // raw
        'Strict'          // SameSite
      )
    );

    // $response->headers->clearCookie('token');

    return $response;
  }

  public function refreshAccessToken(Request $request)
  {
    $jwt_key = \Drupal::service('settings')->get('jwt_key');
    $token = $request->cookies->get('refresh_token');

    if (!$token) {
      return new JsonResponse(['error' => 'Missing refresh token'], 401);
    }

    try {
      $decoded = JWT::decode($token, new Key($jwt_key, 'HS256'));

      // Проверим, существует ли пользователь
      $user = \Drupal\user\Entity\User::load($decoded->sub ?? 0);

      if (!$user || !$user->isActive()) {
        return new JsonResponse(['error' => 'User not found or inactive'], 401);
      }

      // Генерируем новый access token
      $newAccessToken = $this->generateAccessToken($user);

      return new JsonResponse(['access_token' => $newAccessToken]);
    } catch (\Firebase\JWT\ExpiredException $e) {
      return new JsonResponse(['error' => 'Refresh token expired'], 401);
    } catch (\Exception $e) {
      return new JsonResponse(['error' => 'Invalid refresh token'], 401);
    }
  }

  public function getUser(Request $request)
  {
    $jwt_key = \Drupal::service('settings')->get('jwt_key');
    $token = $request->cookies->get('refresh_token');

    if (!$token) {
      return new JsonResponse(['error' => 'Missing refresh token'], 401);
    }

    try {
      $decoded = JWT::decode($token, new Key($jwt_key, 'HS256'));
      return new JsonResponse(['message' => 'Token valid', 'data' => (array) $decoded]);
    } catch (\Exception $e) {
      return new JsonResponse(['error' => 'Invalid refresh token'], 401);
    }
  }
}
