## Node.js User Management

## Introduction

Welcome to Project Node.js User Management This project aims to provide a platform for users to connect, share posts, and interact with each other. It allows users to register, log in, create posts with various media types, follow other users, like posts, and more.

## Features

- User registration with validation:
  - Users can create an account by providing their name, email, username, password, gender, and mobile number. Validations are performed for email format, password strength, and mobile number format.
- User login with JWT token authentication:
  - Registered users can log in using their credentials. JWT (JSON Web Token) is used for secure authentication and verification of subsequent requests.
- User profile management:
  - Users can view and update their profile information, including name, username, gender, and mobile number. They can also set their profile as public or private.
- Post creation with text, images, and videos:
  - Users can create posts with text content and optionally attach images and videos. Multiple media types can be uploaded in a single post.
- Privacy settings for posts (public/private):
  - Users can choose to make their posts public or private. Public posts are visible to all users, while private posts are only visible to the post creator's approved followers.
- Follow/unfollow users:
  - Users can follow or unfollow other users to stay updated with their posts. The follower count and following count are tracked for each user.
- Like and delete posts:
  - Users can like posts created by others. Each user can only like a post once. Users can also delete their own posts.
- Block/unblock users (bonus):
  - Users have the ability to block or unblock other users. Blocked users cannot see the blocker's posts/profile, and vice versa.
- Explore API endpoints for public posts:
  - Endpoints are provided to fetch the latest public posts, with an additional field indicating whether the current user has liked each post.
- Pagination for post listing:
  - Posts are paginated, with a default limit of 10 posts per page.
- Edit profile and post functionality:
  - Users can edit their profile information and update their existing posts.
- Soft delete for posts:
  - Posts are not permanently deleted but marked as deleted to maintain data integrity.

## Installation

1.  Clone the repository:

    
        git clone https://github.com/satyaveer1994/istreamo-assignment.git



2.  Install the dependencies:

        cd project-name
        npm install

3.Set up the database:

. Install and configure MongoDB.
. Update the database connection configuration in the project.
. Run the necessary migrations or seed the database (if applicable).

4.Configure environment variables:

. Rename the .env.example file to .env.
. Update the environment variables with the required configuration values.

5.Start the application:

    npm nodemon src/index.js

6.Access the application at http://localhost:3000.

7. A link to the hosted API: https://istreamo-assignment-1.onrender.com

## Usage

1.Register a new user account by providing the required details.

2.Log in using the registered credentials.

3.Explore the different features of the application, including creating posts, following other users, liking posts, editing profiles, and more.

4.Refer to the API documentation for further details on available endpoints and their usage.

## Technologies

- The project is built using the following technologies and tools:

. Node.js
. Express.js
. MongoDB (Database)
. Mongoose (MongoDB ODM)
. JWT (JSON Web Tokens) for authentication

## Contributing

Contributions to the project are welcome! If you encounter any issues, have suggestions, or would like to contribute enhancements, please follow the guidelines below:

1.Fork the repository.

2.Create a new branch for your feature or bug fix.

3.Make the necessary code changes.

4.Test your changes to ensure they work as expected.

5.Submit a pull request, clearly describing the changes you made.

## License

This project is licensed under the MIT License.

     Feel free to modify the content and structure of the README file to fit your project's specific details and requirements.
