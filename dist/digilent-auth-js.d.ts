export declare class DigilentAuthJs {
    private poolData;
    private region;
    private identityPoolId;
    private authenticatedUser;
    /********************************************************************************
     * Construct a DigilentAuthJs Object
     ********************************************************************************/
    constructor();
    /********************************************************************************
     * Initialize the AWS Cognito configuration parameters
     * @param userPoolId AWS Cognito user pool id.
     * @param clientId AWS Cognito user pool client id with access to the specified user pool.
     * @param region AWS Cognito user pool region.
     * @param identityPoolId AWS Cognito Identity Pool id.
     ********************************************************************************/
    initialize(userPoolId: string, clientId: string, region: string, identityPoolId: string): void;
    /********************************************************************************
    * Authenticate the specified username with the specified password.
    * @param username The username to authenticate with.
    * @param password The password associated with the specified username.
    * @return This function returns a Promise that resolves when the user has been authenticated or rejects on error.
    ********************************************************************************/
    authenticateUser(username: string, password: string): Promise<any>;
    /********************************************************************************
    * Get user details for the currently authenticated user.
    * @return This function returns a Promise that resolves with the user data object on success or rejects on error.
    ********************************************************************************/
    getAuthenticatedUserDetails(): Promise<any>;
    /********************************************************************************
    * Sign up a new user.
    * @param email The email address for the new user.
    * @param username The desired username for the new user.
    * @param password The desired password for the new user.  Must conform to the requirements defined in the Cognito User Pool.
    * @param phoneNumber Optional.  Phone number for the new user.  Used for multi-factor authentication.
    * @return This function returns a Promise that resolves with user data on success or rejects on error.
    ********************************************************************************/
    signUp(email: string, username: string, password: string, phoneNumber?: string): Promise<any>;
    /********************************************************************************
    * Confirm new user.
    * @param username The username to confirm.
    * @param code The confirmation code sent to the new user.
    * @return This function returns a Promise that resolves with confirmation data on success or rejects on error.
    ********************************************************************************/
    confirmUser(username: string, code: string): Promise<any>;
    /********************************************************************************
    * Resend the confirmation code to the user.
    * @param username The username to send the confirmation code to.
    * @return This function returns a Promise that resolves on success or rejects on error.
    ********************************************************************************/
    resendConfirmationCode(username: string): Promise<any>;
    /********************************************************************************
    * Delete the currently authenticated user from the Cognito user pool.
    * @return This function returns a Promise that resolves on success or rejects on error.
    ********************************************************************************/
    deleteAuthenticatedUser(): Promise<any>;
    /********************************************************************************
    * Change the password for the currently authenticated user.
    * @param currentPassword The currently authenticated users's password
    * @param newPassword The desired new password for the currently authenticated user.
    * @return This function returns a Promise that resolves on success or rejects on error.
    ********************************************************************************/
    changeAuthenticatedUserPassword(currentPassword: string, newPassword: string): Promise<any>;
    /********************************************************************************
    * Start the forgot password workflow.
    * TODO - Enable developer to pass callbacks.
    * @param username The username to retrieve the password for.
    * @return This function returns a Promise that resolves when the forgot password flow has been successfully started.
    ********************************************************************************/
    forgotPassword(username: string): Promise<any>;
    /********************************************************************************
    * Sign out an unauthenticated user.
    * @param username The username to sign out.
    ********************************************************************************/
    signOutUnauthenticatedUser(username: string): void;
    /********************************************************************************
    * Sign out the authenticated user.
    * @return This function returns a Promise that resolves when the user has been succesfully signed out or rejects on error.
    ********************************************************************************/
    signOutAuthenticatedUser(): Promise<any>;
    /********************************************************************************
    * Check for user details in local storage.  If a user exists authenticate that user.
    * @return This function returns a Promise that resolves if a user was successfully authenticated or rejects otherwise.
    ********************************************************************************/
    getUserFromLocalStorage(): Promise<any>;
    /********************************************************************************
    * This function clears any cached credentials and retrieves new credentials for the authenticated user.
    * @param jwtToken A valid JSON Web Token provided durng AWS authentication.
    * @return This function returns a Promise that resolves once the new credentials have been refreshed or rejects on error.
    ********************************************************************************/
    private setCredentialsAndRefresh(jwtToken);
    /********************************************************************************
    * Build a login object with the specified JWT Token.  This funciton currently only supports tokens provided by AWS Cognito.
    * @param jwtToken A valid JSON Web Token provided durng AWS authentication.
    * @return A login object to use as the 'Logins' component of an AWS.config.credentials object.
    ********************************************************************************/
    private generateLoginObject(jwtToken);
}
/********************************************************************************
* An interface containing AWS Cognito configuration data.
********************************************************************************/
export interface CognitoInfo {
    userPoolId: string;
    clientId: string;
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
}
/********************************************************************************
* An interface containing an AWS Cognito user pool.
********************************************************************************/
export interface PoolData {
    UserPoolId: string;
    ClientId: string;
}
