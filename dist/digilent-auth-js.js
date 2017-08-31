"use strict";
var amazon_cognito_identity_js_1 = require('amazon-cognito-identity-js');
var DigilentAuthJs = (function () {
    /********************************************************************************
     * Construct a DigilentAuthJs Object
     ********************************************************************************/
    function DigilentAuthJs() {
    }
    /********************************************************************************
     * Initialize the AWS Cognito configuration parameters
     * @param userPoolId AWS Cognito user pool id.
     * @param clientId AWS Cognito user pool client id with access to the specified user pool.
     * @param region AWS Cognito user pool region.
     * @param identityPoolId AWS Cognito Identity Pool id.
     ********************************************************************************/
    DigilentAuthJs.prototype.initialize = function (userPoolId, clientId, region, identityPoolId) {
        AWS.config.update({
            region: region
        });
        this.poolData = new amazon_cognito_identity_js_1.CognitoUserPool({
            UserPoolId: userPoolId,
            ClientId: clientId
        });
        this.region = region;
        this.identityPoolId = identityPoolId;
    };
    /********************************************************************************
    * Authenticate the specified username with the specified password.
    * @param username The username to authenticate with.
    * @param password The password associated with the specified username.
    * @return This function returns a Promise that resolves when the user has been authenticated or rejects on error.
    ********************************************************************************/
    DigilentAuthJs.prototype.authenticateUser = function (username, password) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var authenticationDetails = new amazon_cognito_identity_js_1.AuthenticationDetails({
                Username: username,
                Password: password,
            });
            var cognitoUser = new amazon_cognito_identity_js_1.CognitoUser({
                Username: username,
                Pool: _this.poolData
            });
            cognitoUser.authenticateUser(authenticationDetails, {
                onSuccess: function (result) {
                    //console.log('access token + ' + result.getAccessToken().getJwtToken());
                    _this.setCredentialsAndRefresh(result.getIdToken().getJwtToken())
                        .then(function (data) {
                        //console.log(AWS.config.credentials);
                        _this.authenticatedUser = cognitoUser;
                        resolve(cognitoUser);
                    })
                        .catch(function (e) {
                        reject(e);
                    });
                },
                onFailure: function (err) {
                    reject(err);
                },
            });
        });
    };
    /********************************************************************************
    * Get user details for the currently authenticated user.
    * @return This function returns a Promise that resolves with the user data object on success or rejects on error.
    ********************************************************************************/
    DigilentAuthJs.prototype.getAuthenticatedUserDetails = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.authenticatedUser.getUserAttributes(function (err, data) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data);
                }
            });
        });
    };
    /********************************************************************************
    * Sign up a new user.
    * @param email The email address for the new user.
    * @param username The desired username for the new user.
    * @param password The desired password for the new user.  Must conform to the requirements defined in the Cognito User Pool.
    * @param phoneNumber Optional.  Phone number for the new user.  Used for multi-factor authentication.
    * @return This function returns a Promise that resolves with user data on success or rejects on error.
    ********************************************************************************/
    DigilentAuthJs.prototype.signUp = function (email, username, password, phoneNumber) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var attributeList = [];
            var attributeEmail = new amazon_cognito_identity_js_1.CognitoUserAttribute({
                Name: 'email',
                Value: email
            });
            attributeList.push(attributeEmail);
            if (phoneNumber != undefined) {
                var attributePhoneNumber = new amazon_cognito_identity_js_1.CognitoUserAttribute({
                    Name: 'phone_number',
                    Value: phoneNumber
                });
                attributeList.push(attributePhoneNumber);
            }
            _this.poolData.signUp(username, password, attributeList, null, function (err, data) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data);
                }
            });
        });
    };
    /********************************************************************************
    * Confirm new user.
    * @param username The username to confirm.
    * @param code The confirmation code sent to the new user.
    * @return This function returns a Promise that resolves with confirmation data on success or rejects on error.
    ********************************************************************************/
    DigilentAuthJs.prototype.confirmUser = function (username, code) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var cognitoUser = new amazon_cognito_identity_js_1.CognitoUser({
                Username: username,
                Pool: _this.poolData
            });
            cognitoUser.confirmRegistration(code, false, function (err, data) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data);
                }
            });
        });
    };
    /********************************************************************************
    * Resend the confirmation code to the user.
    * @param username The username to send the confirmation code to.
    * @return This function returns a Promise that resolves on success or rejects on error.
    ********************************************************************************/
    DigilentAuthJs.prototype.resendConfirmationCode = function (username) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var cognitoUser = new amazon_cognito_identity_js_1.CognitoUser({
                Username: username,
                Pool: _this.poolData
            });
            cognitoUser.resendConfirmationCode(function (err, data) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data);
                }
            });
        });
    };
    /********************************************************************************
    * Delete the currently authenticated user from the Cognito user pool.
    * @return This function returns a Promise that resolves on success or rejects on error.
    ********************************************************************************/
    DigilentAuthJs.prototype.deleteAuthenticatedUser = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.authenticatedUser.deleteUser(function (err, data) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data);
                }
            });
        });
    };
    /********************************************************************************
    * Change the password for the currently authenticated user.
    * @param currentPassword The currently authenticated users's password
    * @param newPassword The desired new password for the currently authenticated user.
    * @return This function returns a Promise that resolves on success or rejects on error.
    ********************************************************************************/
    DigilentAuthJs.prototype.changeAuthenticatedUserPassword = function (currentPassword, newPassword) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.authenticatedUser.changePassword(currentPassword, newPassword, function (err, data) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data);
                }
            });
        });
    };
    /********************************************************************************
    * Start the forgot password workflow.
    * TODO - Enable developer to pass callbacks.
    * @param username The username to retrieve the password for.
    * @return This function returns a Promise that resolves when the forgot password flow has been successfully started.
    ********************************************************************************/
    DigilentAuthJs.prototype.forgotPassword = function (username) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var cognitoUser = new amazon_cognito_identity_js_1.CognitoUser({
                Username: username,
                Pool: _this.poolData
            });
            cognitoUser.forgotPassword({
                onSuccess: function () {
                    // successfully initiated reset password request                    
                    resolve();
                },
                onFailure: function (err) {
                    alert(err);
                    reject(err);
                },
                //Optional automatic callback
                inputVerificationCode: function (data) {
                    //console.log('Code sent to: ' + data);
                    var verificationCode = prompt('Please input verification code ', '');
                    var newPassword = prompt('Enter new password ', '');
                    cognitoUser.confirmPassword(verificationCode, newPassword, this);
                }
            });
        });
    };
    /********************************************************************************
    * Sign out an unauthenticated user.
    * @param username The username to sign out.
    ********************************************************************************/
    DigilentAuthJs.prototype.signOutUnauthenticatedUser = function (username) {
        var cognitoUser = new amazon_cognito_identity_js_1.CognitoUser({
            Username: username,
            Pool: this.poolData
        });
        cognitoUser.signOut();
        this.authenticatedUser = undefined;
    };
    /********************************************************************************
    * Sign out the authenticated user.
    * @return This function returns a Promise that resolves when the user has been succesfully signed out or rejects on error.
    ********************************************************************************/
    DigilentAuthJs.prototype.signOutAuthenticatedUser = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.authenticatedUser.globalSignOut({
                onSuccess: function (data) {
                    _this.authenticatedUser = undefined;
                    resolve(data);
                },
                onFailure: function (err) {
                    reject(err);
                }
            });
        });
    };
    /********************************************************************************
    * Check for user details in local storage.  If a user exists authenticate that user.
    * @return This function returns a Promise that resolves if a user was successfully authenticated or rejects otherwise.
    ********************************************************************************/
    DigilentAuthJs.prototype.getUserFromLocalStorage = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var cognitoUser = _this.poolData.getCurrentUser();
            if (cognitoUser != null) {
                cognitoUser.getSession(function (err, session) {
                    if (err) {
                        //alert(err);
                        reject(err);
                        return;
                    }
                    //console.log('session validity: ' + session.isValid());
                    // NOTE: getSession must be called to authenticate user before calling getUserAttributes
                    cognitoUser.getUserAttributes(function (err, attributes) {
                        if (err) {
                            // Handle error
                            reject(err);
                            return;
                        }
                        else {
                            // Do something with attributes
                            _this.setCredentialsAndRefresh(session.getIdToken().getJwtToken())
                                .then(function () {
                                _this.authenticatedUser = cognitoUser;
                                resolve(cognitoUser);
                            })
                                .catch(function (e) {
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
    };
    //---------------------------------------- Private ----------------------------------------
    /********************************************************************************
    * This function clears any cached credentials and retrieves new credentials for the authenticated user.
    * @param jwtToken A valid JSON Web Token provided durng AWS authentication.
    * @return This function returns a Promise that resolves once the new credentials have been refreshed or rejects on error.
    ********************************************************************************/
    DigilentAuthJs.prototype.setCredentialsAndRefresh = function (jwtToken) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            //Create temp credentials and call clearCachedId() so that cached info from both a 
            //previous load and the current session aren't saved.
            var tempCredentials = new AWS.CognitoIdentityCredentials({
                IdentityPoolId: _this.identityPoolId,
                Logins: _this.generateLoginObject(jwtToken)
            });
            tempCredentials.clearCachedId();
            AWS.config.credentials = new AWS.CognitoIdentityCredentials({
                IdentityPoolId: _this.identityPoolId,
                Logins: _this.generateLoginObject(jwtToken)
            });
            //console.log('getting credentials');
            AWS.config.credentials.get(function (err) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
    };
    /********************************************************************************
    * Build a login object with the specified JWT Token.  This funciton currently only supports tokens provided by AWS Cognito.
    * @param jwtToken A valid JSON Web Token provided durng AWS authentication.
    * @return A login object to use as the 'Logins' component of an AWS.config.credentials object.
    ********************************************************************************/
    DigilentAuthJs.prototype.generateLoginObject = function (jwtToken) {
        var loginObject = {};
        var loginKey = 'cognito-idp.' + this.region + '.amazonaws.com/' + this.poolData.getUserPoolId();
        loginObject[loginKey] = jwtToken;
        return loginObject;
    };
    return DigilentAuthJs;
}());
exports.DigilentAuthJs = DigilentAuthJs;
//# sourceMappingURL=digilent-auth-js.js.map