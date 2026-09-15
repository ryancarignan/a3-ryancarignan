# a3-ryancarignan

[Link to project via render.](https://a3-ryancarignan.onrender.com/)

## Description

This site provides the ability to manage a list of vehicles and get estimates on their values. Users can add vehicles via the form on the first form, and edit or delete vehicles via the list below it. Delete by pressing the delete button on a vehicle listing. Edit by clicking on the vehicle listing, editing the fields as desired, and then pressing the submit button on the inline form.

One challenge I faced was implementing the redirection of unauthenticated users back to the login page, using middleware in the server code.

I chose to implement simple cookie-based authentication, because it seemed easiest for a small site like this which doesn't necessarily need to worry so much about valuable user data being stored in it.

I used [Pure.css](https://pure-css.github.io/) for the CSS framework, because it provides lightweight baseline styling for forms and grid formatting, which all this site really needs. Pure is pretty small so there was a decent bit of custom CSS used, mostly for centering items, custom colors, and aligning border styling with the Pure standards.

## Technical Achievements
- **100% Lighthouse Tests**: I got 100% in the four lighthouse tests required for both the login page and the main content page. The two reports are provided ([login page](./lighthouse-report-login.pdf), [main page](./lighthouse-report-main.pdf)).
- **Express Middleware Packages**: I used `cookie-session` to manage user session cookies.

### Design/Evaluation Achievements
*N/A*
