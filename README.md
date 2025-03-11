# Finance tracker

Welcome to the Finance tracker! This project is a personal finance management tool designed to help you record and track your income and expenses. Built using Next.js, Prisma, and Shadcn, this app provides a seamless and efficient way to manage your finances and maintain a healthy budget.

## Features

- **User Authentication**: Secure login and registration system to keep your data safe.
- **Income Tracking**: Easily record and categorize your income sources.
- **Expense Tracking**: Log your expenses with details and categorize them for better analysis.
- **Balance Calculation**: Automatically calculates your current balance based on recorded income and expenses.
- **Responsive Design**: Accessible on all devices, providing a smooth user experience on desktops, tablets, and mobile phones.

## Technologies Used

- **Next.js**: A powerful React framework for building server-side rendered and static web applications.
- **Prisma**: A modern database toolkit to manage and interact with your database in an efficient and type-safe way.
- **Shadcn**: A component library for building consistent and aesthetically pleasing user interfaces.
- **MongoDB**: A NoSQL database for flexible and scalable data storage.

## Getting Started

### Prerequisites

- Node.js
- npm or yarn
- MongoDB (Atlas or local instance)

### Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/uday-bhardwaj-15/Yardstick-assessment-by-uday-bhardwaj
    
    ```

2. Install dependencies:
    ```bash
    npm install
    # or
    yarn install
    ```

3. Set up the database:
    - Copy the `.env.example` file to `.env`:
      ```bash
      cp .env.example .env
      ```
    - Update the `DATABASE_URL` in the `.env` file with your MongoDB connection string:
      ```plaintext
      DATABASE_URL="your-mongodb-connection-string"
      ```

4. Run database migrations:
    ```bash
    npx prisma migrate dev
    # or
    yarn prisma migrate dev
    ```

5. Start the development server:
    ```bash
    npm run dev
    # or
    yarn dev
    ```

6. Open your browser and navigate to `http://localhost:3000`.

## Usage

1. Register a new account or log in with your existing credentials.
2. Navigate to the income or expense section to add new records.
3. View your financial summary on the dashboard.

## Contributing

Contributions are welcome! If you have suggestions for new features or improvements, feel free to open an issue or submit a pull request.

### Steps to Contribute

1. Fork the repository.
2. Create a new branch:
    ```bash
    git checkout -b feature-name
    ```
3. Make your changes and commit them:
    ```bash
    git commit -m "Add some feature"
    ```
4. Push to the branch:
    ```bash
    git push origin feature-name
    ```
5. Open a pull request.


---

Thank you for checking out the Budget App! Happy budgeting!

