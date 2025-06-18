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

      // $request->query - Это объект (symfony), представляющий GET-параметры из URL (query string)
      // Пример запроса: GET /api/get-books?limit=5&offset=10
      // Вот эта часть: ?limit=5&offset=10 — это и есть query string.

      // ->get('limit', 10) - Пытается получить значение параметра limit из query string.
      // Если его нет, то возвращает дефолтное значение — 10
      $limit = (int) $request->query->get('limit', 5); // int - явное приведение в php
      $offset = (int) $request->query->get('offset', 0);

      $connection = \Drupal::database();

      // Сначала считаем общее количество записей
      $count_query = $connection->select('books', 'b')
        ->condition('uid', $uid)
        ->countQuery();
      $total = (int) $count_query->execute()->fetchField();

      $query = $connection->select('books', 'b')
        ->fields('b', ['id', 'uid', 'name', 'author', 'created'])
        ->condition('uid', $uid) // фильтрация по пользователю
        ->range($offset, $limit);
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

      // return new JsonResponse($data);
      return new JsonResponse([
        'items' => $data,
        'total' => $total,
        'limit' => $limit,
        'offset' => $offset,
      ]);
    } catch (\Exception $e) {
      return new JsonResponse(['error' => 'Unauthorized: ' . $e->getMessage()], 401);
    }
  }
}
