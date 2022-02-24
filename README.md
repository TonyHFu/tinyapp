# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

## Final Product

!["Landing page for users"](https://github.com/tofutigerz/tinyapp/blob/main/docs/urls_landing.png)

!["URL homepage with statistics"](https://github.com/tofutigerz/tinyapp/blob/main/docs/url_specific_page.png)

## Dependencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session
- method-override

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.

## Site Routes

`GET /` 
- Redirects to `/urls` if logged in 
- Redirects to `/login` if not logged in

`GET /urls`
- If logged in, displays landing page
!["Landing page for users"](https://github.com/tofutigerz/tinyapp/blob/main/docs/urls_landing.png)
- If not logged in, tells users to log in !["Landing page when not logged in"](https://github.com/tofutigerz/tinyapp/blob/main/docs/not_logged_urls.png)

`GET /urls/new`
- If logged in, displays page for creating new short URL:
!["Adding new URL page"](https://github.com/tofutigerz/tinyapp/blob/main/docs/create_new.png)
- if not logged in, redirects to `/login`

`GET /urls/:id`
- If user logged in, displays URL landing page
!["Short URL landing page"](https://github.com/tofutigerz/tinyapp/blob/main/docs/url_specific_page.png)
- Error messages for when user is not logged in, when user does not own URL, and if URL does not exist

`GET /u/:id`
- If short URL exists, redirects
- Error message if short URL does not exist

`POST /urls`
- If logged in, generates a short URL and associates it with the user and the long URL entered
- Error message if user not logged in

`PUT /urls/:id`
- If user logged in and owns URL, updates short URL and redirects to `/urls`
- Shown error messages if user not logged in, user does not own short URL, or if short URL does not exist

`DELETE /urls/:id`
- If user logged in, deletes short URL and redirects to `/urls` 
- Error messages if user not logged in, does not own URL, or short URL does not exist

`GET /login`
- If not logged in, displays login page
!["Login page"](https://github.com/tofutigerz/tinyapp/blob/main/docs/login.png)
- If logged in, redirects to `/urls`

`GET /register`
- If not logged in, displays registration page
!["Short URL landing page"](https://github.com/tofutigerz/tinyapp/blob/main/docs/register.png)
- If logged in, redirects to `/urls`

`POST /login`
- If email and passwords match existing user, sets a cookie and redirects to `/urls`
- Error messages if problems with email and/or password

`POST /register`
- Errors if email and/or password empty
- Error if email already exists
- If no errors, creates new user, sets cookie and redirects to `/urls`

`POST /logout`
- deletes user ID cookie and redirects `/urls`