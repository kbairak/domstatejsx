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
