# http-utils-client

const client = {
users: {
async create (user: CreateUser) {
await jsonReponse<User>(http.post(url('/users/'), user))

    }

}
user(userId: string): {
projects: {
async list() {
await jsonReponse<Projects[]>(await http.get(`/users/{userId}/projects`))

    }

},
project(projectId) {
async join() {
await jsonReponse<Boolean>(await http.post(`/users/{userId}/project/{projectId}/join`))
}

}
}

}

await client.user(ilMioIdSalavto).projects.list() =>> // [{project1}]
await client.user(ilMioIdSalavto).project(123).join() =>> // true

<Button onClick={() => {
client.user(ilMioIdSalavto).project(123).join()
.then(() => showPopup('sei entrato nel prohetto 123'))
.catch((error) => {
showPopoup('error non puoi entrare perche` {error.message})
})
}
}}>
