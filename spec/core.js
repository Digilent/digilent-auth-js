global.AWS = require('aws-sdk');
let awsTestCredentials = require('../awsTestCredentials.json');
let DigilentAuthJs = require('../dist/digilent-auth-js.js').DigilentAuthJs;
var prompt = require('syncprompt');

// authenticating requires that a callback be given that returns a new password
// in case the user is asked to change theirs upon logging in.
function returnNewPassword() {
    return awsTestCredentials.password;
}

describe("Digilent-Auth-JS core", () => {

    describe("test environment", () => {
        it('has valid credentials in ./awsTestCredentials.json', () => {
            expect(awsTestCredentials.userPoolId).toBeDefined();
            expect(awsTestCredentials.clientId).toBeDefined();
            expect(awsTestCredentials.region).toBeDefined();
            expect(awsTestCredentials.identityPoolId).toBeDefined();
        });

        it('includes aws-sdk.', () => {
            expect(AWS).toBeDefined();
        });

        it('does not already have aws config credentials', () => {
            expect(AWS.config.credentials).toBeNull();
        });

        it('has a constructor that returns an instnace of the class', () => {
            let digilentAuthJs = new DigilentAuthJs();
            expect(digilentAuthJs).toBeDefined();
        });
    });
    
    // this is in a separeate "object" describe because it requires the test to
    // 'pause' while the tester goes and confirms the user.
    describe("object", () => {
        let originalTimeout;
        
        beforeEach(() => {
            originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        });

        it('can successfully sign-up a user', (done) => {
            jasmine.DEFAULT_TIMEOUT_INTERVAL = 5000;
            let digilentAuthJs = new DigilentAuthJs();

            digilentAuthJs.initialize(
                awsTestCredentials.userPoolId,
                awsTestCredentials.clientId,
                awsTestCredentials.region,
                awsTestCredentials.identityPoolId
            );

            digilentAuthJs.signUp(
                'andrew.holzer@digilent.com',
                awsTestCredentials.username,
                awsTestCredentials.password
            )
            .then((success) => {
                done();           
            })
            .catch((error) => {
                expect(true).toBe(false);
            });
        });

        afterEach(function () {
            jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
        });
        
        afterAll(() => {
            prompt('\r\nPress Enter after confirming user');
        });
    });

    describe("object", () => {
        let originalTimeout;
        beforeEach(() => {
            originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;           
        });

        it('has a constructor that returns an instnace of the class', () => {
            let digilentAuthJs = new DigilentAuthJs();
            expect(digilentAuthJs).toBeDefined();
        });

        it('member variables are undefined on instantiation', () => {
            let digilentAuthJs = new DigilentAuthJs();
            expect(digilentAuthJs.poolData).toBeUndefined();
            expect(digilentAuthJs.region).toBeUndefined();
            expect(digilentAuthJs.identityPoolId).toBeUndefined();
            expect(digilentAuthJs.authenticatedUser).toBeUndefined();
        });

        it('can be initilized with AWS configuration settings ', () => {
            let digilentAuthJs = new DigilentAuthJs();
            digilentAuthJs.initialize(awsTestCredentials.userPoolId, awsTestCredentials.clientId, awsTestCredentials.region, awsTestCredentials.identityPoolId);
            expect(digilentAuthJs.poolData).toBeDefined();
            expect(digilentAuthJs.region).toBe(awsTestCredentials.region);
            expect(digilentAuthJs.identityPoolId).toBe(awsTestCredentials.identityPoolId);
            expect(digilentAuthJs.authenticatedUser).toBeUndefined();
        });

        it('can succesfully authenticate a user', (done) => {
            jasmine.DEFAULT_TIMEOUT_INTERVAL = 5000;

            let digilentAuthJs = new DigilentAuthJs();
            
            digilentAuthJs.initialize(awsTestCredentials.userPoolId, awsTestCredentials.clientId, awsTestCredentials.region, awsTestCredentials.identityPoolId);
            digilentAuthJs.authenticateUser(
                awsTestCredentials.username,
                awsTestCredentials.password,
                returnNewPassword
            )
            .then((success) => {
                expect(true).toBe(true);
                done();
            })
            .catch((e) => {
                console.log(e);
                expect(true).toBe(false);
            })
        });

        it('can successfully change a user\'s password', (done) => {
            jasmine.DEFAULT_TIMEOUT_INTERVAL = 5000;

            let digilentAuthJs = new DigilentAuthJs();
            let newPassword = "testpassword";
            
            digilentAuthJs.initialize(
                awsTestCredentials.userPoolId, 
                awsTestCredentials.clientId, 
                awsTestCredentials.region, 
                awsTestCredentials.identityPoolId
            );
            
            digilentAuthJs.authenticateUser(
                awsTestCredentials.username,
                awsTestCredentials.password,
                returnNewPassword
            )
            .then((success) => {
                digilentAuthJs.changeAuthenticatedUserPassword(
                    awsTestCredentials.password, newPassword
                )
                .then((success) => {
                    awsTestCredentials.password = newPassword; // so that subsequent tests don't fail as a result of the password change
                    expect(true).toBe(true);
                    done();
                })
                .catch((e) => {
                    console.log(e);
                    expect(true).toBe(false);
                });
            })
            .catch((e) => {
                console.log(e);
                expect(true).toBe(false);
            });
        });
        
        it('can succesfully sign-out a user', (done) => {
            jasmine.DEFAULT_TIMEOUT_INTERVAL = 5000;

            let digilentAuthJs = new DigilentAuthJs();
            
            digilentAuthJs.initialize(
                awsTestCredentials.userPoolId, 
                awsTestCredentials.clientId, 
                awsTestCredentials.region, 
                awsTestCredentials.identityPoolId
            );

            digilentAuthJs.authenticateUser(
                awsTestCredentials.username,
                awsTestCredentials.password,
                returnNewPassword
            )
            .then((success) => {
                digilentAuthJs.signOutAuthenticatedUser()
                .then((success) => {
                    expect(true).toBe(true);
                    done();
                })
                .catch((e) => {
                    console.log(e);
                    expect(true).toBe(false);
                });
            })
            .catch((e) => {
                console.log(e);
                expect(true).toBe(false);
            });
        });
        
        it('can successfully delete a user', (done) =>{
            jasmine.DEFAULT_TIMEOUT_INTERVAL = 5000;

            let digilentAuthJs = new DigilentAuthJs();
            
            digilentAuthJs.initialize(
                awsTestCredentials.userPoolId, 
                awsTestCredentials.clientId, 
                awsTestCredentials.region, 
                awsTestCredentials.identityPoolId
            );

            digilentAuthJs.authenticateUser(
                awsTestCredentials.username,
                awsTestCredentials.password,
                returnNewPassword
            )
            .then((success) => {
                digilentAuthJs.deleteAuthenticatedUser()
                .then((success) => {
                    expect(true).toBe(true);
                    done();
                })
                .catch((e) => {
                    console.log(e);
                    expect(true).toBe(false);
                });
            })
            .catch((e) => {
                console.log(e);
                expect(true).toBe(false);
            });
        });

        afterEach(function () {
            jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
        });
    });    
});

