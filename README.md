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
  "query": {
    "_action": "AddChange",
    "PHYSCNT": 7,
    "PHYSCNTDATE": "2017-01-26T20:35:56-06:00",
    "RECONCILED": 0,
    // MUST ENCRYPT THIS AND SEND AS "MAXAUTH" HEADER...
    // "_lid": "foo",
    // "_lpwd": "bar",
    "_format":"json"
  },
  "postUrl": "https://www.openfn.org/inbox/some-secret-uuid",
})
```

### Sample post with existing data
```js
post({
  "endpoint": "INSERT_URL_HERE",
  "body": function(state) {
        return {
          "field_1": "some_data",
          "field_2": "some_more_data",
          "field_id": dataValue("Some.Json.Object.Id")(state)
        }

  }
})

```

[Docs](docs/index)


Development
-----------

Clone the repo, run `npm install`.

Run tests using `npm run test` or `npm run test:watch`

Build the project using `make`.
