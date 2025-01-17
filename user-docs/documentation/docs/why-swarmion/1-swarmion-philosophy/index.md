import DocCardList from '@theme/DocCardList';
import {useCurrentSidebarCategory} from '@docusaurus/theme-common';

# Swarmion philosophy

<DocCardList items={useCurrentSidebarCategory().items}/>

## What is Swarmion?

### Motivation

Swarmion is an open-source framework for building type-safe Serverless microservices at scale. It takes full advantage of the **Serverless Framework** to handle deployment and provisioning of resources, while adding support for microservices and end-to-end type-safety.

A great emphasis has been made on developer experience, since working with a Typescript monorepo is a challenge.

### Approach

Swarmion is composed of two parts:

- a template for starting state-of-the-art projects
- a set of tools and plugins, to ease the communication between microservices and secure their deployment

## Our core beliefs

### Your codebase should adapt to your team organization

Changes in the way you organize your teams should not have an impact on the speed at which you can develop and deploy new features. Therefore, Swarmion uses a flexible microservices approach in a monorepo.

### Don't Repeat Yourself (DRY)

Having several teams working in the same environment requires efficient collaboration. Swarmion allows to clearly separate the shared logic and interfaces from the service-specific logic for better decoupling and safer interactions.

### Developer experience is key for code quality

As your codebase grows, testing and deployment times are likely to skyrocket. Swarmion uses optimized low-level software ([esbuild](https://esbuild.github.io/), [vitejs](https://vitejs.dev/)) to reduce testing and building times and a smart monorepo management tool ([Nx](https://nx.dev)) to provide a top-level developer experience and reduce CI/CD delays.

### Trust your deployments (beta)

As the number of moving parts in your organization increases, it is paramount to secure the deployment process. At each deployment, Swarmion validates requested changes against all impacted services to prevent breaking changes.
