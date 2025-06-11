<?php

namespace Drupal\books\Controller;

use Drupal\Core\Controller\ControllerBase;
use Symfony\Component\HttpFoundation\JsonResponse;
use Drupal\Core\Database\Database;
use Symfony\Component\HttpFoundation\Request;

class BooksController extends ControllerBase
{
  private function getUserFromAccessToken(Request $request)
  {
    $jwt_key = \Drupal::service('settings')->get('jwt_key');
    // $token = $request->cookies->get('refresh_token');
    $authHeader = $request->headers->get('Authorization');
    // if (!$token) {
    //   throw new \Exception('Missing token');
    // }
    if (!$authHeader || !preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
      throw new \Exception('Missing or invalid Authorization header');
    }
    $accessToken = $matches[1];
    // $decoded = \Firebase\JWT\JWT::decode($token, new \Firebase\JWT\Key($jwt_key, 'HS256'));
    $decoded = \Firebase\JWT\JWT::decode($accessToken, new \Firebase\JWT\Key($jwt_key, 'HS256'));
    return (array) $decoded;
  }

  public function getBooks(Request $request)
  {
    try {
      $userData = $this->getUserFromAccessToken($request);
      $uid = $userData['sub'];

      $connection = \Drupal::database();
      $query = $connection->select('books', 'b')
        ->fields('b', ['id', 'uid', 'name', 'author', 'created'])
        ->condition('uid', $uid); // фильтрация по пользователю

      $results = $query->execute()->fetchAll();

      $data = [];
      foreach ($results as $record) {
        $data[] = [
          'id' => (int) $record->id,
          'uid' => (int) $record->uid,
          'name' => $record->name,
          'author' => $record->author,
          'created' => (int) $record->created,
        ];
      }

      return new JsonResponse($data);
    } catch (\Exception $e) {
      return new JsonResponse(['error' => 'Unauthorized: ' . $e->getMessage()], 401);
    }
  }
}
