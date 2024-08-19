# Project Setup Instructions

This document provides step-by-step instructions to set up and run the project locally.

## Prerequisites

- **PostgreSQL**: Ensure PostgreSQL is installed on your machine.
- **Python**: Make sure Python 3.12 is installed.
- **Node.js & npm**: Ensure Node.js and npm are installed.

## Step 1: Install PostgreSQL and Create a Database

1. **Install PostgreSQL**: Follow the [official PostgreSQL installation guide](https://www.postgresql.org/download/) to install PostgreSQL on your system.
2. **Create a Database**:

   - Open the PostgreSQL command-line tool (psql) and run the following command to create a new database:
     ```sql
     CREATE DATABASE your_database_name;
     ```
   - Optionally, create a new user and assign a password (skip if you are using the default `postgres` user):
     ```sql
     CREATE USER your_username WITH PASSWORD 'your_password';
     ```

3. **Configure the Environment Variables**:
   - Create a `.env` file in the `backend` directory with the following contents:
     ```
     DATABASE_URL=postgresql+psycopg://your_username:your_password@localhost:your_port/your_database_name

     GOOGLE_MAPS_API_KEY=
     ```

## Step 2: Set Up the Backend

1. **Navigate to the Backend Directory**:

## Step 2: Set Up the Backend

1. **Navigate to the Backend Directory**

    ```bash
    cd backend
    ```

2. **Set Up a Virtual Environment**

   - On Linux/MacOS: Use Python to create and activate a virtual environment.

   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

   - On Windows: Use Python to create and activate a virtual environment.

   ```bash
   python -m venv venv
   venv\Scripts\activate
   ```

3. **Install Python Dependencies** by running the package manager with the provided requirements file.

    ```bash
    pip install -r requirements.txt
    ```

4. **Run the Backend Server** to start the application in development mode.

    ```bash
    uvicorn app.main:app --reload
    ```

## Step 3: Set Up the Frontend

1. **Navigate to the Frontend Directory**

    ```bash
    cd frontend
    ```

2. **Install Node.js Dependencies** by using the package manager to install all required packages.

    ```bash
    npm install
    ```

3. **Run the Frontend Server** to start the frontend application in development mode.

    ```bash
    npm run dev
    ```

## Notes

- The backend is built with **FastAPI**.
- The frontend is built with **Next.js**.
