import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI
import static com.kms.katalon.core.testobject.ObjectRepository.findTestObject
import internal.GlobalVariable as GlobalVariable

// Registers a brand-new user; in development the OTP code is shown on screen.
String stamp = (new Date()).getTime().toString()
String email = 'qa+' + stamp + '@bdt.local'

WebUI.openBrowser('')
WebUI.maximizeWindow()
WebUI.navigateToUrl(GlobalVariable.BASE_URL + '/auth')
WebUI.click(findTestObject('Auth/btn_ToggleMode'))   // switch to Sign Up
WebUI.setText(findTestObject('Auth/input_Name'), 'QA Auto ' + stamp)
WebUI.setText(findTestObject('Auth/input_Email'), email)
WebUI.setText(findTestObject('Auth/input_Password'), GlobalVariable.TEST_PASSWORD)
WebUI.click(findTestObject('Auth/btn_SignIn'))
// Registration success = the OTP step appears with a dev verification code on screen.
// (Entering the 6-box OTP is component-specific; the core feature validated here is
//  that signup creates the account and triggers email verification.)
WebUI.waitForElementVisible(findTestObject('Auth/span_DevCode'), GlobalVariable.DEFAULT_TIMEOUT as int)
String codeText = WebUI.getText(findTestObject('Auth/span_DevCode'))
WebUI.verifyMatch(codeText, '(?i).*development code.*\\d{6}.*', true)
WebUI.closeBrowser()
