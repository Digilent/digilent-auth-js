import { CognitoUserPool, CognitoUserAttribute, CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js';

declare var AWS: any;

export class DigilentAuthJs {

    public authenticated: boolean = false;

    private poolData: CognitoUserPool;
    private region: string;
    private identityPoolId: string;
    private authenticatedUser: CognitoUser;
    private unauthenticatedUser: CognitoUser;

    /********************************************************************************
     * Construct a DigilentAuthJs Object
     ********************************************************************************/
    constructor() {
    }

    /********************************************************************************
     * Initialize the AWS Cognito configuration parameters
     * @param userPoolId AWS Cognito user pool id.
     * @param clientId AWS Cognito user pool client id with access to the specified user pool.
     * @param region AWS Cognito user pool region.
     * @param identityPoolId AWS Cognito Identity Pool id.
     ********************************************************************************/
    public initialize(userPoolId: string, clientId: string, region: string, identityPoolId: string) {
        AWS.config.update({
            region: region
        });
        this.poolData = new CognitoUserPool({
            UserPoolId: userPoolId,
            ClientId: clientId
        });
        this.region = region;
        this.identityPoolId = identityPoolId;
    }

    /********************************************************************************
    * Authenticate the specified username with the specified password. 
    * @param username The username to authenticate with.
    * @param password The password associated with the specified username.
    * @param getPasswordCallback Callback that returns a password string when a new one is required.
    * @return This function returns a Promise that resolves when the user has been authenticated or rejects on error.
    ********************************************************************************/
    public authenticateUser(username: string, password: string, getPasswordCallback: () => string = null): Promise<any> {
        return new Promise((resolve, reject) => {
            let authenticationDetails = new AuthenticationDetails({
                Username: username,
                Password: password,
            });
            let cognitoUser = new CognitoUser({
                Username: username,
                Pool: this.poolData
            });

            let params = {
                onSuccess: (result) => {
                    //console.log('access token + ' + result.getAccessToken().getJwtToken());
                    this.setCredentialsAndRefresh(result.getIdToken().getJwtToken())
                        .then((data) => {
                            //console.log(AWS.config.credentials);
                            this.authenticated = true;
                            this.authenticatedUser = cognitoUser;
                            resolve(cognitoUser);
                        })
                        .catch((e) => {
                            reject(e);
                        });
                },
                onFailure: (err) => {
                    reject(err);
                },
                newPasswordRequired: (userAttributes, requiredAttributes) => {
                    if (getPasswordCallback == null) throw 'getPasswordCallback not defined';

                    let newPass = getPasswordCallback();
                    if (newPass === "") throw 'getPasswordCallback must return something!';

                    delete userAttributes.email_verified;

                    cognitoUser.completeNewPasswordChallenge(newPass, userAttributes, params);
                }
            }

            cognitoUser.authenticateUser(authenticationDetails, params);
        });
    }

    /********************************************************************************
    * Get user details for the currently authenticated user.
    * @return This function returns a Promise that resolves with the user data object on success or rejects on error.
    ********************************************************************************/
    public getAuthenticatedUserDetails(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.authenticatedUser.getUserAttributes((err, data) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data);
                }
            });
        });
    }

    /********************************************************************************
    * Sign up a new user.
    * @param email The email address for the new user.
    * @param username The desired username for the new user.
    * @param password The desired password for the new user.  Must conform to the requirements defined in the Cognito User Pool.
    * @param phoneNumber Optional.  Phone number for the new user.  Used for multi-factor authentication.
    * @return This function returns a Promise that resolves with user data on success or rejects on error.
    ********************************************************************************/
    public signUp(email: string, username: string, password: string, phoneNumber?: string): Promise<any> {
        return new Promise((resolve, reject) => {
            let attributeList: CognitoUserAttribute[] = [];
            let attributeEmail: CognitoUserAttribute = new CognitoUserAttribute({
                Name: 'email',
                Value: email
            });
            attributeList.push(attributeEmail);
            if (phoneNumber != undefined) {
                let attributePhoneNumber = new CognitoUserAttribute({
                    Name: 'phone_number',
                    Value: phoneNumber
                });
                attributeList.push(attributePhoneNumber);
            }
            this.poolData.signUp(username, password, attributeList, null, (err, data) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data)
                }
            });
        });
    }

    /********************************************************************************
    * Confirm new user.
    * @param username The username to confirm.
    * @param code The confirmation code sent to the new user.    
    * @return This function returns a Promise that resolves with confirmation data on success or rejects on error.
    ********************************************************************************/
    public confirmUser(username: string, code: string): Promise<any> {
        return new Promise((resolve, reject) => {
            let cognitoUser: CognitoUser = new CognitoUser({
                Username: username,
                Pool: this.poolData
            });
            cognitoUser.confirmRegistration(code, false, (err, data) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data)
                }
            });
        });
    }

    /********************************************************************************
    * Resend the confirmation code to the user.
    * @param username The username to send the confirmation code to.
    * @return This function returns a Promise that resolves on success or rejects on error.
    ********************************************************************************/
    public resendConfirmationCode(username: string): Promise<any> {
        return new Promise((resolve, reject) => {
            let cognitoUser = new CognitoUser({
                Username: username,
                Pool: this.poolData
            });
            cognitoUser.resendConfirmationCode((err, data) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data);
                }
            });
        });
    }

    /********************************************************************************
    * Delete the currently authenticated user from the Cognito user pool.
    * @return This function returns a Promise that resolves on success or rejects on error.
    ********************************************************************************/
    public deleteAuthenticatedUser(): Promise<any> {
        return new Promise((resolve, reject) => {
            (<any>this.authenticatedUser).deleteUser((err, data) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data);
                }
            });
        });
    }

    /********************************************************************************
    * Change the password for the currently authenticated user.
    * @param currentPassword The currently authenticated users's password
    * @param newPassword The desired new password for the currently authenticated user.
    * @return This function returns a Promise that resolves on success or rejects on error.
    ********************************************************************************/
    public changeAuthenticatedUserPassword(currentPassword: string, newPassword: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.authenticatedUser.changePassword(currentPassword, newPassword, (err, data) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data);
                }
            });
        });
    }

    /********************************************************************************
    * Start the forgot password workflow.  
    * TODO - Enable developer to pass callbacks.    
    * @param username The username to retrieve the password for.    
    * @return This function returns a Promise that resolves when the forgot password flow has been successfully started.
    ********************************************************************************/
    public forgotPassword(username: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.unauthenticatedUser = new CognitoUser({
                Username: username,
                Pool: this.poolData
            });
            this.unauthenticatedUser.forgotPassword({
                onSuccess: function () {
                    // successfully initiated reset password request                    
                    resolve();
                },
                onFailure: function (err) {                    
                    reject(err);
                }                
            });            
        });
    }

    /********************************************************************************
    * Reset the user's password.  Call forgot password before calling this function to generate the password reset verification code.
    * @param verificationCode The password reset verification code.
    * @param newPassowrd The desired new password.
    ********************************************************************************/
    public resetPassword(verificationCode: string, newPassword: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.unauthenticatedUser.confirmPassword(verificationCode, newPassword, {
                onSuccess: () => {
                    resolve();
                },
                onFailure: () => {
                    reject('Failed to reset password');
                }
            });
        });
    }


    /********************************************************************************
    * Sign out an unauthenticated user.
    * @param username The username to sign out.    
    ********************************************************************************/
    public signOutUnauthenticatedUser(username: string) {
        let cognitoUser = new CognitoUser({
            Username: username,
            Pool: this.poolData
        });
        cognitoUser.signOut();
        this.authenticated = false;
        this.authenticatedUser = undefined;
    }

    /********************************************************************************
    * Sign out the authenticated user.
    * @return This function returns a Promise that resolves when the user has been succesfully signed out or rejects on error.
    ********************************************************************************/
    public signOutAuthenticatedUser(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.authenticatedUser.globalSignOut({
                onSuccess: (data) => {
                    this.authenticated = false;
                    this.authenticatedUser = undefined;
                    resolve(data);
                },
                onFailure: (err) => {
                    reject(err);
                }
            });
        });
    }

    /********************************************************************************
    * Check for user details in local storage.  If a user exists authenticate that user.
    * @return This function returns a Promise that resolves if a user was successfully authenticated or rejects otherwise.
    ********************************************************************************/
    public getUserFromLocalStorage(): Promise<any> {
        return new Promise((resolve, reject) => {
            var cognitoUser = this.poolData.getCurrentUser();
            if (cognitoUser != null) {
                cognitoUser.getSession((err, session) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    //console.log('session validity: ' + session.isValid());
                    // NOTE: getSession must be called to authenticate user before calling getUserAttributes
                    cognitoUser.getUserAttributes((err, attributes) => {
                        if (err) {
                            // Handle error
                            reject(err);
                            return;
                        } else {
                            // Do something with attributes
                            this.setCredentialsAndRefresh(session.getIdToken().getJwtToken())
                                .then(() => {
                                    this.authenticated = true;
                                    this.authenticatedUser = cognitoUser;
                                    resolve(cognitoUser);
                                })
                                .catch((e) => {
                                    reject(e);
                                });
                        }
                    });
                });
            }
            else {
                reject('No User Found');
            }
        });
    }

    /********************************************************************************
    * Get the user name of an authenticated user.
    * @return The username of the authenticated user, or undefined if the user is not authenticated.
    ********************************************************************************/
    public getUsername(): string {
        if (this.authenticated) {
            return this.authenticatedUser.getUsername();
        }
        else {
            return undefined;
        }
    }






    //---------------------------------------- Private ----------------------------------------


    /********************************************************************************
    * This function clears any cached credentials and retrieves new credentials for the authenticated user.
    * @param jwtToken A valid JSON Web Token provided durng AWS authentication.
    * @return This function returns a Promise that resolves once the new credentials have been refreshed or rejects on error.
    ********************************************************************************/
    private setCredentialsAndRefresh(jwtToken: any): Promise<any> {
        return new Promise((resolve, reject) => {
            //Create temp credentials and call clearCachedId() so that cached info from both a 
            //previous load and the current session aren't saved.
            let tempCredentials = new AWS.CognitoIdentityCredentials({
                IdentityPoolId: this.identityPoolId,
                Logins: this.generateLoginObject(jwtToken)
            });
            tempCredentials.clearCachedId();
            AWS.config.credentials = new AWS.CognitoIdentityCredentials({
                IdentityPoolId: this.identityPoolId,
                Logins: this.generateLoginObject(jwtToken)
            });
            //console.log('getting credentials');
            AWS.config.credentials.get((err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
    }

    /********************************************************************************
    * Build a login object with the specified JWT Token.  This funciton currently only supports tokens provided by AWS Cognito.
    * @param jwtToken A valid JSON Web Token provided durng AWS authentication.
    * @return A login object to use as the 'Logins' component of an AWS.config.credentials object.
    ********************************************************************************/
    private generateLoginObject(jwtToken: any) {
        let loginObject = {};
        let loginKey = 'cognito-idp.' + this.region + '.amazonaws.com/' + this.poolData.getUserPoolId();
        loginObject[loginKey] = jwtToken;
        return loginObject;
    }

}

/********************************************************************************
* An interface containing AWS Cognito configuration data.
********************************************************************************/
export interface CognitoInfo {
    userPoolId: string,
    clientId: string,
    region: string,
    accessKeyId: string,
    secretAccessKey: string
}

/********************************************************************************
* An interface containing an AWS Cognito user pool.
********************************************************************************/
export interface PoolData {
    UserPoolId: string,
    ClientId: string
}