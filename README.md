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

## :rocket: Simple Usage

a simple example how to build a client with requerest

```javascript
// this is just an Headers object
const authorization = () => {
  Authorization: 'Bearer my.bearer.token'
}

const client = new RequeRest('http://localhost')
const info = await client.get('info') // GET http://localhost/info

const authorizedClient = client.with(authorization)
const userResource = authorizedClient.path('users')
const userPostsResource = (id: string) => userResource.path(`${id}/posts`)

const users = await userResource.query({ banned: false }).get() // GET http://localhost/users?banned=false { Authorization: 'Bearer my.bearer.token' }
const foo = await userResource.get('foo') // GET http://localhost/users/foo { Authorization: 'Bearer my.bearer.token' }

const fooAvatar = await userResource.decode('image/png').get('foo/avatar') // GET http://localhost/users/foo/avatar { Authorization: 'Bearer my.bearer.token' }
const fooPosts = await userPostResource(foo.id).get() // GET http://localhosts/users/foo/posts { Authorization: 'Bearer my.bearer.token' }
```

## :artificial_satellite: Better Usage

```javascript
// a module that contains the client

const client = new RequeRest('http://localhost')
const clientBearer = client.with(() => {
  Authorization: window.localStorage.getItem('bearerToken')
}) // or whatever logic is in your app

const userResource = clientBearer.path('users')

export default {
  users: {
    list: (query) => userResource.query(query).get(),
    create: (user) => userResource.post(user),
  },
  user: (id) => ({
    read: () => userResource.path(id).get(),
    update: (data) => userResource.path(id).patch(data),
    delete: () => userResource.path(id).delete(),
    avatar: () =>
      userResource.path(id).path('avatar').decode('image/png').get(),
    posts: {
      // default values
      list: (query = { showDeleted: true }) =>
        userResource.path(id).path('posts').query(query).get(),
      create: (data) => userResource.path(id).path('posts').post(post),

      // and so on
    },
  }),
}
```

```javascript
// client usage
import client from './client'

const users = await client.users.list()
await users.create({ id: 'foo', name: 'Foo', surname: 'Bar' })

const foo = await client.user('foo')

const fooUser = await foo.read()
const fooAvatar = await foo.avatar()
const fooPosts = await foo.posts.list({ showDeleted: false })

await foo.posts.create({ title: 'hello world', body: 'Hello to everyone!' })
```

## :cool: User Requerest in NodeJs

RequeRest is using `fetch` interface, so to use in node you have
to install node-fetch.

```bash
npm i node-fetch
```

## :books: Documentation

[Full Documentation](https://giovannicardam.one/reuerest)

## :label: License

[MIT](https://github.com/GiovanniCardamone/reuerest/blob/main/LICENSE)
