package com.bdt

import static com.kms.katalon.core.testobject.ObjectRepository.findTestObject
import com.kms.katalon.core.annotation.Keyword
import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI
import internal.GlobalVariable as GlobalVariable

public class AuthKeywords {

    /** Login as a PRE-VERIFIED user (no OTP step). Lands on the Project Selector. */
    @Keyword
    def loginVerified(String email, String password) {
        WebUI.navigateToUrl(GlobalVariable.BASE_URL + '/auth')
        WebUI.waitForElementVisible(findTestObject('Auth/input_Email'), GlobalVariable.DEFAULT_TIMEOUT as int)
        WebUI.setText(findTestObject('Auth/input_Email'), email)
        WebUI.setText(findTestObject('Auth/input_Password'), password)
        WebUI.click(findTestObject('Auth/btn_SignIn'))
        WebUI.waitForElementVisible(findTestObject('ProjectSelector/btn_NewProject'), GlobalVariable.DEFAULT_TIMEOUT as int)
    }

    /** Login as an UNVERIFIED user: reads the on-screen dev OTP code and submits it. */
    @Keyword
    def loginWithOtp(String email, String password) {
        WebUI.navigateToUrl(GlobalVariable.BASE_URL + '/auth')
        WebUI.setText(findTestObject('Auth/input_Email'), email)
        WebUI.setText(findTestObject('Auth/input_Password'), password)
        WebUI.click(findTestObject('Auth/btn_SignIn'))
        WebUI.waitForElementVisible(findTestObject('Auth/span_DevCode'), GlobalVariable.DEFAULT_TIMEOUT as int)
        String txt = WebUI.getText(findTestObject('Auth/span_DevCode'))
        java.util.regex.Matcher m = (txt =~ /(\d{6})/)
        assert m.find() : 'Dev OTP code not found on screen: ' + txt
        String code = m.group(1)
        WebUI.click(findTestObject('Auth/otp_FirstInput'))
        // OTP component auto-advances on each keystroke
        WebUI.sendKeys(findTestObject('Auth/otp_FirstInput'), code)
        WebUI.waitForElementVisible(findTestObject('ProjectSelector/btn_NewProject'), GlobalVariable.DEFAULT_TIMEOUT as int)
    }

    @Keyword
    def logout() {
        WebUI.click(findTestObject('Navigation/btn_Logout'))
        WebUI.waitForElementVisible(findTestObject('Auth/input_Email'), GlobalVariable.DEFAULT_TIMEOUT as int)
    }

    /** Ensure we are inside the app on a project (continue last, else create new). */
    @Keyword
    def enterAnyProject() {
        // Always open the seeded complete project ("QA Test Cafe") by name — this is
        // robust even after project-creating tests change the user's active project.
        if (WebUI.waitForElementClickable(findTestObject('ProjectSelector/card_QATestCafe'), 8, com.kms.katalon.core.model.FailureHandling.OPTIONAL)) {
            WebUI.click(findTestObject('ProjectSelector/card_QATestCafe'))
        } else if (WebUI.waitForElementClickable(findTestObject('ProjectSelector/btn_ContinueLast'), 5, com.kms.katalon.core.model.FailureHandling.OPTIONAL)) {
            WebUI.click(findTestObject('ProjectSelector/btn_ContinueLast'))
        } else {
            WebUI.click(findTestObject('ProjectSelector/btn_NewProject'))
        }
        WebUI.waitForPageLoad(GlobalVariable.DEFAULT_TIMEOUT as int)
        WebUI.delay(1)
    }
}
