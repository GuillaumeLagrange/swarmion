import DocCardList from '@theme/DocCardList';
import {useCurrentSidebarCategory} from '@docusaurus/theme-common';

# Swarmion tools

In order to manage a scalable codebase, Swarmion comes with state of the art tooling for a Typescript monorepo. In this section, you'll learn why we chose each one, and what is important to know about them.

The main philosophy is to allow easy customization of the different tools used in the packages, without having to write too much code. Every tool can be configured at the root level and extended through composition at the package level.

# Main features

<DocCardList items={useCurrentSidebarCategory().items}/>
