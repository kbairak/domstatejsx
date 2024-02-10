This is a sandbox for `domstatejsx`.

In order to get it up and running, you have to do:

```sh
git clone https://github.com/kbairak/domstatejsx
cd domstatejsx
npm install
npm run dev
```

There are a number of applications under `./src/`. In order to choose which one
you want to run, change the first line in `./src/main.jsx`. for example:

```diff
-import App from './todos';
+import App from './accordion';
```

[Here](https://www.kbairak.net/programming/react/2024/02/04/domstatejsx.html)
is a blog post where I explain how this works.


## TODOs

### General

- [ ] Documentation
- [x] Build options to extract the library to `dist`
- [x] Upload to NPM
- [ ] Add types
- [x] Create vite plugin for easy use
- [ ] Look into possible memory leaks

### Specific features

General:

- [ ] Find ways to keep the refs definition and jsx closer for easier reading

Forms:

- [ ] Forms should be able to work with `<select>` elements
- [ ] Forms should be able to work with custom input components

Routing:

- [ ] Routing with `<Outlet/>`s
- [ ] Data router
- [ ] Make `<Link>`s aware of whether they are selected

Context:

- [ ] Test with different contents of `<Provider>`s
- [ ] See if we can avoid extra `<div>`s with fragments
