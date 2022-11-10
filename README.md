# icebreaQ-server

This is the server implementation of icebreaQ. It is built with `express`, `node-gyp`, `napi`, `socket.io`.

## Environment

- `node v14.20.1`

## Get Started

We assume this project is installed on ubuntu 16.04 or macOS.

### Before Download

You should install node v14.20.1

**WE RECOMMEND INSTALLING `node` VIA `nvm`**

1. [Install nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
2. `nvm install 14`
3. `nvm use 14`

### Download and Configuration

1. download the git repository and install dependencies

```bash
git clone https://github.com/Team-ILA/icebreaQ-server.git
cd icebreaQ-server
npm install
```

2. set configuration for the server

```bash
cat .env.example > .env
sh ./configure_bindings.sh
```

**You should fill all the environment variables correctly in `.env` as described.**

### Running the Program

```bash
# FOR DEV (tracks code changes)
npm run dev

# FOR PRODUCTION
npm run build
npm start
```

## API Document

COMMON PREFIX: `/api`

| METHOD | API                | DESCRIPTION                                       | NOTES          |
| ------ | ------------------ | ------------------------------------------------- | -------------- |
| `POST` | `/users/resgister` | sign up users with email, password, username.     |                |
| `POST` | `/users/login`     | sign in users with registered email and password. |                |
| `GET`  | `/users`           | get user info if a user is logged in. (session)   |                |
| `POST` | `/quiz`            | create a quiz                                     | requires login |
| `GET`  | `/quiz/:quizId`    | get information of a quiz                         | requires login |
| `GET`  | `/quiz/:quizId`    | get information of a quiz                         | requires login |
