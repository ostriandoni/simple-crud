# simple-crud
CRUD RESTFUL API using Node JS, Express JS, MySQL, Redis and RabbitMQ.


## API Features
```
1. Create Item
2. Get all Items
3. Get Each Item by ID
4. Delete Item
5. Update Item
6. Purchase Item
```

## Getting Started

Ensure Redis and RabbitMQ is installed and running on your local machine.

  1. `git clone git@github.com:ostriandoni/simple-crud.git`
  2. `cd simple-crud`
  3. `npm install`
  4.  rename `.env.example` to `.env` and set up based on your local machine, for example:
  ```
  NODE_ENV=development
  PORT=3000
  REDIS_HOST=localhost
  REDIS_PORT=6379
  KNEX_CLIENT=mysql
  MYSQL_HOST=localhost
  MYSQL_USER=donny
  MYSQL_PASS=root
  MYSQL_PORT=3306
  MYSQL_DB=donnydb
  RABBITMQ_URL=amqp://localhost
  ```
  5. `npm start`

Step-by-step above will get you a copy of the project up and running on your local machine for development and testing purposes.

## API Endpoint List

### 1. Create item
Endpoint: POST /item

Payload:
```
{
  "name": "palu",
  "price": 50000,
  "stock": 8
}
```

Response:
```
{
  "message": "Item created",
  "result": {
    "id": 7,
    "name": "palu",
    "price": 50000,
    "stock": 8
  }
}
```

### 2. Get item by ID
Endpoint: GET /item/:id

Payload: none

Response:
```
{
  "result": {
    "id": 7,
    "name": "palu",
    "price": 50000,
    "stock": 8
  }
}
```

### 3. Get all items
Endpoint: GET /items

Payload: none

Response:
```
{
  "result": [
    {
      "id": 1,
      "name": "paku",
      "price": 990,
      "stock": 10
    },
    {
      "id": 2,
      "name": "bata",
      "price": 9000,
      "stock": 80
    },
    {
      "id": 6,
      "name": "lem",
      "price": 1000,
      "stock": 18
    },
    {
      "id": 7,
      "name": "palu",
      "price": 50000,
      "stock": 8
    }
  ]
}
```

### 4. Update item
Endpoint: PUT /item/:id

Payload:
```
{
  "name": "paku",
  "price": 1000,
  "stock": 100
}
```

Response:
```
{
  "message": "Item updated",
  "result": {
    "id": "1",
    "name": "paku",
    "price": 1000,
    "stock": 100
  }
}
```

### 5. Delete item
Endpoint: DELETE /item/:id

Payload: none

Response:
```
{
  "message": "Item deleted",
  "result": {
    "id": "7"
  }
}
```

### 6. Purchase item
Endpoint: PUT /item/:id/buy

Payload:
```
{
  "quantity": 21
}
```

Response:
```
{
  "message": "Purchased successfully",
  "result": {
    "name": "paku",
    "price": 1000,
    "stock": 79
  }
}
```
