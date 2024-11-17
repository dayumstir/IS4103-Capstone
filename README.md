# PandaPay

A Buy Now, Pay Later (BNPL) Application with E-Wallet Integration

---

## Overview

**PandaPay** is a Buy Now, Pay Later (BNPL) platform that enables users to make purchases and pay in installments using an integrated e-wallet system. The app is designed to provide flexibility in financial management, giving users the ability to make purchases now and pay over time with secure and smooth transactions.

---

## Devs Guide

### Pull Request (PR) Template

When submitting a pull request, please use the following template for consistency and clarity:

```md
## Description

Please include a summary of the changes and the problem this PR solves.

## Related Issue

-   Link to any issue this PR addresses.

## Type of Change

-   [ ] Bug Fix
-   [ ] Feature
-   [ ] Refactor
-   [ ] Documentation Update

## Checklist before requesting a review

-   [ ] Build is clean without errors (Check for regression)
-   [ ] Unit tests have been added
-   [ ] Necessary documentation/comments have been added

## Additional Information

-   Anything else you'd like to mention.
```

---

### Steps to Run the Application

#### 1. Install Dependencies

In the root folder of the project, run the following command to install all necessary dependencies:

```bash
npm install
```

In the /src folder of the /credit-service directory, run the following command:

```bash
pip install -r requirements.txt
```

#### 2a. Run Backend Server

Navigate to the /backend directory and run the backend server using the command below::

```bash
npm run dev
```

Once the server is running, you can access it at:
[http://localhost:3000)](http://localhost:3000)

#### 2b. Run Credit Service

Navigate to the /credit-service directory and run the credit service using the command below:

```bash
python3 main.py
```

#### 2c. Run Customer-Facing Mobile App

Navigate to the /mobile directory and run the following command:

```bash
npm run dev
```

Once the server is running, you can access it at:
[http://localhost:19006)](http://localhost:19006)

Alternatively, to run the app on a mobile device using the Expo Go app, use one of the following commands:

```bash
npm run ios
npm run android
```

#### 2d. Run Admin Web Portal

Navigate to the /web-admin directory and run:

```bash
npm run dev
```

Once the server is running, you can access it at:
[http://localhost:5173)](http://localhost:5173)

#### 2e. Run Merchant Web Portal

Navigate to the /web-merchant directory and run:

```bash
npm run dev
```

Once the server is running, you can access it at:
[http://localhost:5173)](http://localhost:5173)

#### 2f. Run Prisma Client

Navigate to the /database directory and run:

```bash
npx prisma studio
```

To safely exit any running service and avoid port conflicts, use: Control + C

---

### Technologies Used

#### Database - AWS RDS

-   **Amazon Relational Database Service (RDS)** is a fully managed relational database service that supports various database engines.
-   [Learn more about AWS RDS](https://aws.amazon.com/rds/)

#### Backend - Express

-   **Express** is a minimal and flexible Node.js web application framework, providing robust features for building web and mobile applications.
-   [Learn more about Express](https://expressjs.com/)

#### Frontend - React Native

-   **React Native** is a popular framework for building mobile applications using React and JavaScript. It enables code-sharing between iOS and Android platforms.
-   [Learn more about React Native](https://reactnative.dev/)

#### ORM - Prisma

-   **Prisma** is an open-source ORM that simplifies database access, with support for typesafety and autocompletion in TypeScript.
-   [Learn more about Prisma](https://www.prisma.io/)

#### Language - TypeScript

-   **TypeScript** is a statically typed superset of JavaScript that adds types, making development more predictable and reducing bugs.
-   [Learn more about TypeScript](https://www.typescriptlang.org/)

---

### Documentation

-   [Google Drive](https://drive.google.com/drive/folders/1jgmVts8W849sHCS-REjpDbGd2jwD_tdQ)
-   [Miro Board](https://miro.com/app/board/uXjVKs6oD_c=/)
-   [Figma Board](https://www.figma.com/files/team/1409532474326341599/all-projects?fuid=986181946351646567)

---

# Turborepo react-native starter

This is an official starter Turborepo.

## Using this example

Run the following command:

```sh
npx create-turbo@latest -e with-react-native-web
```

## What's inside?

This Turborepo includes the following packages/apps:

### Apps and Packages

-   `native`: a [react-native](https://reactnative.dev/) app built with [expo](https://docs.expo.dev/)
-   `web`: a [Next.js](https://nextjs.org/) app built with [react-native-web](https://necolas.github.io/react-native-web/)
-   `@repo/ui`: a stub [react-native](https://reactnative.dev/) component library shared by both `web` and `native` applications
-   `@repo/typescript-config`: `tsconfig.json`s used throughout the monorepo

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

### Utilities

This Turborepo has some additional tools already setup for you:

-   [Expo](https://docs.expo.dev/) for native development
-   [TypeScript](https://www.typescriptlang.org/) for static type checking
-   [Prettier](https://prettier.io) for code formatting
