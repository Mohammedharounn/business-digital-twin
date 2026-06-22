
/**
 * This class is generated automatically by Katalon Studio and should not be modified or deleted.
 */

import java.lang.String


 /** Login as a PRE-VERIFIED user (no OTP step). Lands on the Project Selector. */ 
def static "com.bdt.AuthKeywords.loginVerified"(
    	String email	
     , 	String password	) {
    (new com.bdt.AuthKeywords()).loginVerified(
        	email
         , 	password)
}

 /** Login as an UNVERIFIED user: reads the on-screen dev OTP code and submits it. */ 
def static "com.bdt.AuthKeywords.loginWithOtp"(
    	String email	
     , 	String password	) {
    (new com.bdt.AuthKeywords()).loginWithOtp(
        	email
         , 	password)
}


def static "com.bdt.AuthKeywords.logout"() {
    (new com.bdt.AuthKeywords()).logout()
}

 /** Ensure we are inside the app on a project (continue last, else create new). */ 
def static "com.bdt.AuthKeywords.enterAnyProject"() {
    (new com.bdt.AuthKeywords()).enterAnyProject()
}

 /** Logs in a VERIFIED user via API and returns the JWT access token. */ 
def static "com.bdt.ApiKeywords.getAuthToken"(
    	String email	
     , 	String password	) {
    (new com.bdt.ApiKeywords()).getAuthToken(
        	email
         , 	password)
}


def static "com.bdt.ApiKeywords.getProjects"(
    	String token	) {
    (new com.bdt.ApiKeywords()).getProjects(
        	token)
}


def static "com.bdt.ApiKeywords.searchEbay"(
    	String token	
     , 	String query	) {
    (new com.bdt.ApiKeywords()).searchEbay(
        	token
         , 	query)
}
