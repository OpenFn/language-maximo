Language Maximo
==============

Language Pack for building expressions and operations to access IBM Maximo EAM.

Documentation
-------------
## Fetch

#### sample configuration
```js
{
  "username": "taylor",
  "password": "supersecret",
  "baseUrl": "https://maximo-demo76.mro.com",
}
```

#### sample fetch expression
```js
fetch({
  "getEndpoint": "maxrest/rest/os/mxinvbal",
  "query": "_lpwd=xxx&_lid=xxx&itemnum=PUMP100&binnum=N-G-2&_format=json",
  "postUrl": "https://www.openfn.org/inbox/some-secret-uuid",
})
```

### Sample post with existing data
```js
post({
  url: "INSERT_URL_HERE",
  "body": function(state) {
        return {
          "field_1": "some_data",
          "field_2": "some_more_data",
          "field_id": dataValue("Some.Json.Object.Id")(state)
        }

  },
  headers: {
      "Authorization": "AUTH_KEY",
      "Content-Type": "application/json"
  }
})

```

[Docs](docs/index)


Development
-----------

Clone the repo, run `npm install`.

Run tests using `npm run test` or `npm run test:watch`

Build the project using `make`.
