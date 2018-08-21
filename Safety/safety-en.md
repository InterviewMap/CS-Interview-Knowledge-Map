<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [XSS](#xss)
  - [How to attack](#how-to-attack)
  - [How to defend](#how-to-defend)
  - [CSP](#csp)
- [CSRF](#csrf)
  - [How to attack](#how-to-attack-1)
  - [How to defend](#how-to-defend-1)
    - [SameSite](#samesite)
    - [Verify Referer](#verify-referer)
    - [Token](#token)
- [Password security](#password-security)
  - [Add salt](#add-salt)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## XSS

> **Cross-site scripting**（Cross-site scripting in English, often abbreviated as XSS）is one kind of security vulnerabilities attack of web applications ， and is a kind of [code input](https://www.wikiwand.com/zh-hans/%E4%BB%A3%E7%A2%BC%E6%B3%A8%E5%85%A5)It allows malicious users to input code into web pages, and other users are affected when they browse web pages. Such attacks often include HTML and consumer-side scripting languages.

XSS is divided into three types: reflective type, storage type, and DOM-based type

### How to attack

XSS attacks websites by modifying HTML nodes or run JS code.

For example, get some parameters through the URL

```html
<!-- http://www.domain.com?name=<script>alert(1)</script> -->
<div>{{name}}</div>                                                  
```

The URL input above may change the HTML into `<div><script>alert(1)</script></div>` so that there is an extra executable script out of the page. This type of attack is a reflection attack, or DOM-based attack

There is also another scenario. For example, if you write an article that contains the attack code `<script>alert(1)</script>`, then users who may be browsing the article will be attacked. This type of attack is a store attack, which can also be called a DOM-based attack.

### How to defend

The most common practice is to escape the input and output, escape the quotes, angle brackets, and slashes.

```js
function escape(str) {
    str = str.replace(/&/g, "&amp;");
    str = str.replace(/</g, "&lt;");
    str = str.replace(/>/g, "&gt;");
    str = str.replace(/"/g, "&quto;");
    str = str.replace(/'/g, "&#39;");
    str = str.replace(/`/g, "&#96;");
    str = str.replace(/\//g, "&#x2F;");
    return str
}
```

The attack code `<script>alert(1)</script>` can be changed by escaping

```js
// -> &lt;script&gt;alert(1)&lt;&#x2F;script&gt;
escape('<script>alert(1)</script>')
```

For displaying rich text, all characters cannot be escaped by the above method, because this will filter out the required format. This kind of situation usually adopts the method of the white list to filter, certainly can also pass the black list to filter, but consider the too many labels and attribute that need to filter, it is more recommended to use the white list way.

```js
var xss = require("xss");
var html = xss('<h1 id="title">XSS Demo</h1><script>alert("xss");</script>');
// -> <h1>XSS Demo</h1>&lt;script&gt;alert("xss");&lt;/script&gt;
console.log(html);
```

The above example uses `js-xss` to implement. You can see that the `h1` tag is preserved in the output and the `script` tag is filtered.

### CSP

The Content Security Policy ([CSP] (https://developer.mozilla.org/en-US/docs/Glossary/CSP)) is an additional layer of security that detects and undermines certain types of attacks, including Cross-site scripting ([XSS] (https://developer.mozilla.org/en-US/docs/Glossary/XSS)) and data injection attacks. Whether it's data theft, website content contamination or malware, these attacks are the primary means.

We can minimize XSS attacks with CSP. CSP is also essentially whitelisted, which stipulates that browsers can only execute code from a specific source.

You can usually enable the CSP with the `Content-Security-Policy` in the HTTP Header.

- Only allow  loading of self-site resource

  ```http
  Content-Security-Policy: default-src ‘self’
  ```

- Only allow loading HTTPS protocol pictures

  ```http
  Content-Security-Policy: img-src https://*
  ```

- Allow loading of any source frame

  ```http
  Content-Security-Policy: child-src 'none'
  ```

More attributes can be viewed at [here] (https://content-security-policy.com/)

## CSRF

> **Cross-site request forgery (English: Cross-site request forgery), also known as **one-click attack** or **session riding**, usually abbreviated as **CSRF** or **XSRF** is an attack method that forces users to perform unintended operations on currently logged-in web applications. [[1\]](https://www.wikiwand.com/zh/%E8%B7%A8%E7%AB%99%E8%AF%B7%E6%B1%82%E4%BC%AA%E9%80%A0#citenoteRistic1)  Follow [cross-site script](https://www.wikiwand.com/zh/%E8%B7%A8%E7%B6%B2%E7%AB%99%E6%8C%87%E4%BB%A4%E7%A2%BC) (XSS) Compared to **XSS**, users trust the designated website and CSRF uses the website's trust in the user's web browser.

To put it simply, CSRF uses the login state of the user to initiate a malicious request.

### How to attack

Assume that there is an interface on the site that submits user comments through a Get request. The attacker can then add a picture to the phishing site. The address of the picture is the comment interface.

```html
<img src="http://www.domain.com/xxx?comment='attack'"/>
```

If the interface is submitted by the Post, it is relatively troublesome, you need to use the form to submit the interface.

```html
<form action="http://www.domain.com/xxx" id="CSRF" method="post">
    <input name="comment" value="attack" type="hidden">
</form>
```

### How to defend

There are several rules for defending against CSRF:

1. Get request does not modify the data
2. Do not allow third-party websites to access user cookies
3. Block third-party website request interfaces
4. Request verification information, such as verification code or token

#### SameSite

The `SameSite` attribute can be set on cookies. This attribute sets the cookie not to be sent along with cross-domain requests. This attribute can greatly reduce the CSRF attack, but this attribute is currently not compatible with all browsers.

#### Verify Referer

For requests that need protection against CSRF, we can verify the Referer to determine if the request was initiated by a third-party website.

#### Token

The server sends a random Token (the algorithm cannot be complex). The Token is carried on each request, and the server verifies that the Token is valid.

## Password security

Although password security is mostly a back-end thing, as a good front-end programmer, you need to be familiar with this knowledge.

### Add salt

For password storage, it must be stored in the database in the clear, otherwise, once the database is leaked, it will cause great losses to the user. And it is not recommended to encrypt the password only by the encryption algorithm because of the rainbow table relationship.

It is usually necessary to add salt to the password and then perform several encryptions with different encryption algorithms.

It is often necessary to add a salt to the password and then encrypt it several times with different encryption algorithms.

```js
// Adding salt means adding a string to the original password and increasing the length of the original password.
sha256(sha1(md5(salt + password + salt)))
```

But adding salt does not prevent others from stealing accounts. It only ensures that even if the database is compromised, the user's real password will not be exposed. Once the attacker gets the user's account, the password can be cracked by brute force. In this case, a verification code is usually used to increase the delay or limit the number of attempts. And once the user enters the wrong password, the user cannot directly prompt the user to enter the wrong password, but should prompt the account or password to be incorrect.
