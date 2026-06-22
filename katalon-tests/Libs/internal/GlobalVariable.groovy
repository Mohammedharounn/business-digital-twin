package internal

import com.kms.katalon.core.configuration.RunConfiguration
import com.kms.katalon.core.main.TestCaseMain


/**
 * This class is generated automatically by Katalon Studio and should not be modified or deleted.
 */
public class GlobalVariable {
     
    /**
     * <p>Profile default : Frontend (Vite) base URL</p>
     */
    public static Object BASE_URL
     
    /**
     * <p>Profile default : Express backend API base URL</p>
     */
    public static Object API_URL
     
    /**
     * <p>Profile default : Pre-verified test account (created by seed-test-user.js)</p>
     */
    public static Object TEST_EMAIL
     
    /**
     * <p>Profile default : Password for the test account</p>
     */
    public static Object TEST_PASSWORD
     
    /**
     * <p>Profile default : Display name of the test account</p>
     */
    public static Object TEST_NAME
     
    /**
     * <p>Profile default : Second verified account for multi-user isolation tests</p>
     */
    public static Object TEST_EMAIL_2
     
    /**
     * <p>Profile default : Password for the second account</p>
     */
    public static Object TEST_PASSWORD_2
     
    /**
     * <p>Profile default : Email guaranteed not to exist</p>
     */
    public static Object INVALID_EMAIL
     
    /**
     * <p>Profile default : Deliberately wrong password</p>
     */
    public static Object INVALID_PASSWORD
     
    /**
     * <p>Profile default : Default explicit wait (seconds)</p>
     */
    public static Object DEFAULT_TIMEOUT
     

    static {
        try {
            def selectedVariables = TestCaseMain.getGlobalVariables('default')
			selectedVariables += TestCaseMain.getGlobalVariables(RunConfiguration.getExecutionProfile())
    
            BASE_URL = selectedVariables['BASE_URL']
            API_URL = selectedVariables['API_URL']
            TEST_EMAIL = selectedVariables['TEST_EMAIL']
            TEST_PASSWORD = selectedVariables['TEST_PASSWORD']
            TEST_NAME = selectedVariables['TEST_NAME']
            TEST_EMAIL_2 = selectedVariables['TEST_EMAIL_2']
            TEST_PASSWORD_2 = selectedVariables['TEST_PASSWORD_2']
            INVALID_EMAIL = selectedVariables['INVALID_EMAIL']
            INVALID_PASSWORD = selectedVariables['INVALID_PASSWORD']
            DEFAULT_TIMEOUT = selectedVariables['DEFAULT_TIMEOUT']
            
        } catch (Exception e) {
            TestCaseMain.logGlobalVariableError(e)
        }
    }
}
