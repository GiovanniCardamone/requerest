# RequeRest

![Logo](media/images/banner.png)

<div align="center">

![JavaScript](https://img.shields.io/badge/ES6-Supported-yellow.svg?style=for-the-badge&logo=JavaScript) ![TypeScript](https://img.shields.io/badge/TypeScript-Supported-blue.svg?style=for-the-badge&logo=Typescript)

![EcmaScript](https://img.shields.io/badge/ECMAScript-2021-lightgrey?url=https://262.ecma-international.org/12.0/)

[![CI](https://github.com/GiovanniCardamone/requerest/actions/workflows/npm-ci.yml/badge.svg)](https://github.com/GiovanniCardamone/requerest/actions/workflows/npm-ci.yml)
[![Coverage Status](https://coveralls.io/repos/github/GiovanniCardamone/requerest/badge.svg?branch=main)](https://coveralls.io/github/GiovanniCardamone/requerest?branch=main)
[![Known Vulnerabilities](https://snyk.io/test/github/GiovanniCardamone/requerest/badge.svg)](https://snyk.io/test/github/GiovanniCardamone/requerest)
[![NPM version](https://img.shields.io/npm/v/requerest.svg?style=plastic)](https://www.npmjs.com/package/requerest)
[![NPM downloads](https://img.shields.io/npm/dm/requerest.svg?style=plastic)](https://www.npmjs.com/package/requerest)

</div>

RequeRest is a library intended to simplify the interaction from client to server. A lot of effort is put each time
a request have to be done, this library have tools to build your client, so you don't have to

> :warning: Note: this library is focues on "application/json" content type, so, you can
> the library will assume this content-type is used, if you need another serialization method user raw fetch or another library

## :package: Installation

```bash
npm install requerest
```

## :rocket: Usage

a simple example how to build a client with requerest

```javascript
const http = new RequeRest('https://myserver.com')

const authorization = () => {
  Authorization: 'Bearer my.bearer.token'
}

// GET https://myserver.com/users?banned=false
// headers: { 'Authorization': 'Bearer my.bearer.token', 'Accept': 'application/json' }
// response is Object default parsed as JSON of Response Body
const users = await http
  .with(authorization)
  .query({ banned: false })
  .get('users')

// GET http://myserver.com/logo.png
// headers: { 'Accept': 'application/xml' }
// respon
const resource = await http.decode('xml').get('resource.xml')
```

## :: User Requerest in NodeJs

RequeRest is using `fetch` interface, so to use in node you have
to install node-fetch.

```bash
npm i node-fetch
```

## :books: Documentation

[Full Documentation](https://giovannicardam.one/polyfull)

## :label: License

[MIT](https://github.com/GiovanniCardamone/polyfull/blob/main/LICENSE)
