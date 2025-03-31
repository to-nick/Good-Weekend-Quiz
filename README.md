The Weekend Quiz Leaderboard
___________________________________________________________________________________________________________

PROJECT OVERVIEW

The Weekend Quiz Leaderboard allows users to compete against their friends in the weekly quiz. Users can submit their scores, create leagues for their friends to join as well as get metrics and leaderboads on scores throughout the year. 
___________________________________________________________________________________________________________
FEATURES

-User authentication: Users can register and login to see data specific to their scores and leagues. 
-Score tracking: Users can see score data across multiple metrics including weekly wins and total yearly score.
-Leagues: Users can create leagues and invite their friends to join the league to form different competitions.
-Single submission: User only need to submit their score once for the week and their score will automatically be updated across all leagues that they are in.
-Responsive design: The app responds gracefully to all screen sizes.

___________________________________________________________________________________________________________
INSTALLATION

1. Clone the repository:
    git clone https://github.com/to-nick/Good-Weekend-Quiz.git

2. Navigate to the project directory:
    cd The-Good-Weekend-Quiz

3. Install the dependancies from both directories:
    cd gwq-frontend
    npm install
    cd ..
    cd gwq-backend
    npm install

4. Create a database:
    Install MySQL and MySQL workbench and create a database using the the query from "initial_db_query.sql" in the backend directory.

4. Set up the environmental variables:
    View the "ENVexample" file in the server directory and create your own enviromental variables.

5. Run the app:
    - Ensure you are in the backend directory "cd gwq-backend"
    - Then "npm run dev" for development which should run both the front and backend with concurrently.

________________________________________________________________________________________________________________
TECH STACK

## Frontend
    -HTML5, CSS3, Javascript
    -React (For dynamic UI components and visualisations)

## Backend
    -Node.js
    -Express.js
    -Knex (For connecting the server to the database)

## Database
    -MySQL (For storing quiz questions to be fetched by an API)

## Deployment
    -Docker - Dockerfiles are included in both directories as well a .yml file for running the app  as a docker container.

_________________________________________________________________________________________________________________
API DOCUMENTATION

## USERS
- POST /users/register       // To register a new user
- POST /users/login          // For user login

## PROFILE
- POST /profile/create-league   // For creating a new league
- POST /profile/join-league     // For joining an existing league
- GET /profile/display-leagues  // For fetching the leagues the user is part of
- DELETE /profile/leave-league  // For removing yourself from a league

## DATA
- GET /data/scores              // For fetching scores for the leaderboard, including weekly wins, total score and highscore
- POST /data/submit-score       // For submitting a weekly score