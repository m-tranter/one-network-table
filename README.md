Test app for displaying a roadworks table.

Download then uncomment the lines that import dotenv in index.js and doFetch.js

Create a .env file with your data in it, something like this:

```
url='https://datacloud.one.network/?app_key='
user=''
password=''
alias=''
council=''
```

Add your app key, username, password and the name of your council.
Leave the alias empty - that's just an email feature I added that you won't need.

Then run: 

npm install

node app/index.js

Open localhost port 3001 in browser
