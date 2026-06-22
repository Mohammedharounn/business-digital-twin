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
WebUI.verifyElementVisible(findTestObject('Auth/span_DevCode'), com.kms.katalon.core.model.FailureHandling.STOP_ON_FAILURE)
CustomKeywords.'com.bdt.AuthKeywords.loginWithOtp'(email, GlobalVariable.TEST_PASSWORD)
WebUI.verifyElementVisible(findTestObject('ProjectSelector/btn_NewProject'))
WebUI.closeBrowser()
