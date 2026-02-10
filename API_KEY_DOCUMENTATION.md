# AutoMarket AI - Documentação de API Key

## 📋 Visão Geral

O AutoMarket AI oferece integração via API key para lojas que desejam importar veículos em massa de forma programática.

---

## 🔑 Obtendo sua API Key

### 1. Criar uma Loja

Primeiro, você precisa ter uma conta com role `store_owner` e criar uma loja:

```bash
POST /api/trpc/stores.create
Authorization: Bearer <seu_jwt_token>
Content-Type: application/json

{
  "name": "Minha Loja de Veículos",
  "slug": "minha-loja",
  "document": "12.345.678/0001-90",
  "logoUrl": "https://example.com/logo.png"
}
```

### 2. Localizar sua API Key

Após criar a loja, uma **API key única** é gerada automaticamente. Você pode encontrá-la em:

- **Painel da Loja** → Configurações → API Key
- **Resposta da API** ao criar a loja (campo `apiKey`)

**Exemplo de API Key:**
```
vK3mP9xQ2nR7wL4jT8hY1sF6dG5bN0cM
```

⚠️ **IMPORTANTE**: Mantenha sua API key em segredo! Ela permite criar anúncios em nome da sua loja.

---

## 🚀 Usando a API Key

### Endpoint: Importação em Massa

```
POST /api/trpc/integration.bulkImportWithApiKey
```

### Headers

```http
Content-Type: application/json
```

### Body

```json
{
  "apiKey": "vK3mP9xQ2nR7wL4jT8hY1sF6dG5bN0cM",
  "cars": [
    {
      "brand": "Toyota",
      "model": "Corolla",
      "version": "2.0 XEI",
      "yearFab": 2022,
      "yearModel": 2023,
      "price": 125000,
      "mileage": 15000,
      "transmission": "AUTOMATIC",
      "fuel": "FLEX",
      "color": "Prata",
      "description": "Veículo em excelente estado, único dono",
      "features": ["Ar condicionado", "Direção elétrica", "Vidros elétricos"]
    },
    {
      "brand": "Honda",
      "model": "Civic",
      "version": "2.0 Sport",
      "yearFab": 2021,
      "yearModel": 2022,
      "price": 135000,
      "mileage": 25000,
      "transmission": "CVT",
      "fuel": "FLEX",
      "color": "Preto",
      "description": "Carro esportivo, revisões em dia",
      "features": ["Teto solar", "Bancos de couro", "Central multimídia"]
    }
  ]
}
```

### Limites

- **Máximo de 50 veículos** por requisição
- Todos os veículos são criados com status `DRAFT` (rascunho)
- Você pode ativá-los posteriormente via painel ou API

---

## 📊 Resposta da API

### Sucesso (200 OK)

```json
{
  "result": {
    "data": {
      "total": 2,
      "imported": 2,
      "failed": 0,
      "details": {
        "success": [123, 124],
        "failed": []
      }
    }
  }
}
```

### Sucesso Parcial (200 OK)

```json
{
  "result": {
    "data": {
      "total": 3,
      "imported": 2,
      "failed": 1,
      "details": {
        "success": [123, 124],
        "failed": [
          {
            "index": 2,
            "error": "Ano do modelo não pode ser anterior ao ano de fabricação"
          }
        ]
      }
    }
  }
}
```

### Erro: API Key Inválida (401 Unauthorized)

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "API key inválida ou expirada."
  }
}
```

### Erro: API Key Ausente (401 Unauthorized)

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "API key é obrigatória. Inclua o header X-API-Key na requisição."
  }
}
```

---

## 🔒 Segurança

### Boas Práticas

1. **Nunca exponha sua API key** em código frontend ou repositórios públicos
2. **Use variáveis de ambiente** para armazenar a API key
3. **Rotacione a API key periodicamente** (entre em contato com o suporte)
4. **Monitore o uso** da API key no painel da loja

### Exemplo de Uso Seguro (Node.js)

```javascript
// .env
API_KEY=vK3mP9xQ2nR7wL4jT8hY1sF6dG5bN0cM

// script.js
require('dotenv').config();

async function importCars(cars) {
  const response = await fetch('https://automarket.ai/api/trpc/integration.bulkImportWithApiKey', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      apiKey: process.env.API_KEY,
      cars: cars,
    }),
  });

  return await response.json();
}
```

---

## 📝 Validações

### Campos Obrigatórios

| Campo | Tipo | Validação |
|-------|------|-----------|
| `brand` | string | Mínimo 1 caractere |
| `model` | string | Mínimo 1 caractere |
| `version` | string | Mínimo 1 caractere |
| `yearFab` | number | Entre 1900 e ano atual + 1 |
| `yearModel` | number | Entre 1900 e ano atual + 1, **≥ yearFab** |
| `price` | number | Maior que 0 |
| `mileage` | number | Maior ou igual a 0 |
| `transmission` | enum | `MANUAL`, `AUTOMATIC`, `CVT` |
| `fuel` | enum | `FLEX`, `GASOLINE`, `DIESEL`, `ELECTRIC`, `HYBRID` |
| `color` | string | Mínimo 1 caractere |

### Campos Opcionais

| Campo | Tipo | Validação |
|-------|------|-----------|
| `description` | string | Máximo 2000 caracteres |
| `features` | array | Array de strings (opcionais do veículo) |

---

## 🛠️ Exemplos de Integração

### cURL

```bash
curl -X POST https://automarket.ai/api/trpc/integration.bulkImportWithApiKey \
  -H "Content-Type: application/json" \
  -d '{
    "apiKey": "vK3mP9xQ2nR7wL4jT8hY1sF6dG5bN0cM",
    "cars": [{
      "brand": "Toyota",
      "model": "Corolla",
      "version": "2.0 XEI",
      "yearFab": 2022,
      "yearModel": 2023,
      "price": 125000,
      "mileage": 15000,
      "transmission": "AUTOMATIC",
      "fuel": "FLEX",
      "color": "Prata"
    }]
  }'
```

### Python

```python
import requests
import os

API_KEY = os.getenv('AUTOMARKET_API_KEY')
API_URL = 'https://automarket.ai/api/trpc/integration.bulkImportWithApiKey'

cars = [
    {
        "brand": "Toyota",
        "model": "Corolla",
        "version": "2.0 XEI",
        "yearFab": 2022,
        "yearModel": 2023,
        "price": 125000,
        "mileage": 15000,
        "transmission": "AUTOMATIC",
        "fuel": "FLEX",
        "color": "Prata"
    }
]

response = requests.post(API_URL, json={
    'apiKey': API_KEY,
    'cars': cars
})

print(response.json())
```

### PHP

```php
<?php
$apiKey = getenv('AUTOMARKET_API_KEY');
$apiUrl = 'https://automarket.ai/api/trpc/integration.bulkImportWithApiKey';

$cars = [
    [
        'brand' => 'Toyota',
        'model' => 'Corolla',
        'version' => '2.0 XEI',
        'yearFab' => 2022,
        'yearModel' => 2023,
        'price' => 125000,
        'mileage' => 15000,
        'transmission' => 'AUTOMATIC',
        'fuel' => 'FLEX',
        'color' => 'Prata'
    ]
];

$data = [
    'apiKey' => $apiKey,
    'cars' => $cars
];

$options = [
    'http' => [
        'header'  => "Content-type: application/json\r\n",
        'method'  => 'POST',
        'content' => json_encode($data)
    ]
];

$context  = stream_context_create($options);
$result = file_get_contents($apiUrl, false, $context);

echo $result;
?>
```

---

## 📞 Suporte

Se você tiver dúvidas ou problemas com a API key:

- **Email**: suporte@automarket.ai
- **Documentação**: https://automarket.ai/docs
- **Status da API**: https://status.automarket.ai

---

## 🔄 Changelog

### v1.0.0 (2026-02-10)
- ✅ Implementação inicial da API key
- ✅ Endpoint `bulkImportWithApiKey`
- ✅ Validação de API key no middleware
- ✅ Documentação completa
