Trail Image
===========
Flickr front-end with Reddis Cloud caching

Environment Variables
=====================

<table>
<tr><th>Variable</th><th>Encoding</th><th>Purpose</th></tr>
<tr><td>FLICKR_KEY</td><td>None</td><td></td></tr>
<tr><td>FLICKR_TOKEN</td><td>None</td><td></td></tr>
<tr><td>FLICKR_TOKEN_SECRET</td><td>None</td><td></td></tr>
<tr><td>GOOGLE_KEY</td><td>None</td><td></td></tr>
<tr><td>GOOGLE_SEARCH_ID</td><td>None</td><td></td></tr>
<tr><td>RECAPTCHA_PRIVATE</td><td>None</td><td></td></tr>
<tr><td>RECAPTCHA_PUBLIC</td><td>None</td><td></td></tr>
<tr><td>REDISCLOUD_URL</td><td>None</td><td></td></tr>
<tr><td>SMTP_LOGIN</td><td>Base64</td><td></td></tr>
<tr><td>SMTP_PASSWORD</td><td>Base64</td><td></td></tr>
<tr><td>SMTP_RECIPIENT</td><td>Base64</td><td></td></tr>
</table>

## Fonts
[Google Fonts](http://www.google.com/fonts/) are pre-downloaded using
[webfont-dl](https://github.com/mmastrac/webfont-dl). A `webfont` script in `package.json`
performs the download. To enable the script, first run

```
npm install -g webfont-dl
```
Then run the script itself with
```
npm run webfont
```
It shouldn't need to be run, though, unless there's a change to the fonts used.