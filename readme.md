<div>
<h1 align="center">
    <bold>Library System<bold> with node.js, express, and MongoDB.
    <br />
  </h1>
</div>
<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About the project</a>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li>
      <a href="#usage">Usage</a>
      <ul>
        <li><a href="#api-endpoints">API Endpoints</a></li>
      </ul>
    </li>
    <li>
      <a href="#future-ideas">What Will be added to the project in the future?</a>
    </li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->

### About The Project

Library System is a secure, advanced CRUD Application made with RESTful APIs using Node.js, express.js, and MongoDB.
It's a system where users can manage a library of books and authors. A user can create a new account and log into his new account to view his profile, update, delete, and more so he can use a lot of functionalities. The authentication process used in this project is implemented using <a href="https://jwt.io/">JWS (JSON Web Token)</a>. The user can also add new Authors and books if he is authorized as an Admin. The normal user can use a lot of functionalities and features like viewing all books and authors and more. so without further talking, let's take a look at the project and see how to get started with it.

<!-- GETTING STARTED -->

## Getting Started

Here is how you can start and set your environment to use this project step by step.

### Prerequisites

You should have node.js and npm installed on your computer, Regarding MongoDB, we will use Mongo Atlas Cloud which makes it easy for us to get started without worrying about database settings and configurations.

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/ehabcoder/library_system.git
   ```
2. open the project folder in your terminal and install npm packages
   ```sh
   npm install
   ```
3. Create the environment variables file `.env` file in your project directory. The environment variables are simple `Node_ENV = development` `PORT = 5000` `MONGO_URI = your mongo urI` `JWT_SECRET=mysecret`.
4. After adding these variables, head to the terminal and seed the data into the database using this command
   ```sh
       npm run data:import
   ```
   To destroy all data, use this command
   ```sh
   npm run data:destroy
   ```
5. Then run the application using this command
   ```sh
   npm start
   ```
   or
   ```sh
   npm run dev
   ```
   to start the server.

### Usage

This Project consists of three main entities, `User` `Author` `Book` and here I will show you some useful examples of how the project can be used.

### API Endpoints

You will find all the API endpoints inside the project in the controllers' files. before any function, you will find a description for it.
Also, you can find the documentation for the API endpoints created with `Postman` and edited by me here:
<a href="https://documenter.getpostman.com/view/12564279/2s9YJhyLJB">https://documenter.getpostman.com/view/12564279/2s9YJhyLJB</a>

### Future Ideas

Please keep in mind that this project was created in just 8 hours. If I had enough time I would have added these things:

1. Some `automated tests`.
2. `Send emails` so we can send welcome messages to new users and send tokens to users to let them change their passwords if they forget them.
3. I don't know how to use `Docker` for setting up the development environment, but it's in my plan to learn it. The next step after mastering GraphQL is to start reading and learning about `Docker and Kubernetes`. I tried to learn it before but there were some priorities that prevented me from learning it.
