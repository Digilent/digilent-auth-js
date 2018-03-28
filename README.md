# Digilent Auth JS

Digilent wrapper module for user authentication using AWS Cognito

## Getting Started

These instructions will get you a copy of the project up and running on your local machine.

### Prerequisites

1. Node.js
2. npm

### Subdirectories
* **bundle**
  * Contains a bundled js file.
* **dist**
  * Contains the built files ready for release.
* **docs**
  * Contains built documentation from source.
* **examples**
  * Contains simple examples demonstrating how to use this library.
* **spec**
  * Contains test files.
* **src**
  * Contains the source files.

### Installing

Clone this repository

```
git clone https://github.com/Digilent/digilent-auth-js.git
```

Move to project directory

```
cd digilent-auth-js
```

Install dependencies

```
npm install
```

#### Use with Ionic
Install AWS SDK 
```
npm install --save aws-sdk
````

Import AWS SDK into app.component.ts 
```
import 'aws-sdk';
```

Install DigilentAuthJs: 
```
npm install --save @digilent/digilent-auth-js
```

Add DigilentAuthJs as a provide in app.module.ts
```
import { DigilentAuthJs } from '@digilent/digilent-auth-js';

...

providers: [    
    DigilentAuthJs,
    ...
]
```

Import DigilentAuthJs where needed and use dependency injection
```
import {DigilentLambdaJs} from '@digilent/digilent-lambda-js';

...

constructor(
){
  public digilentAuth: DigilentAuthJs,
  ...
}
```

Initialize with AWS credentials (it's recommended to do this early in app.component.ts)
```
this.digilentAuth.initialize(USER_POOL_ID, CLIENT_ID, REGION, IDENTITY_POOL_ID);
```

**Note**: If node-gyp rebuild fails, try the following command:

```
npm install --global --production windows-build-tools
```

Run the example by opening an index.html in the examples folder.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details