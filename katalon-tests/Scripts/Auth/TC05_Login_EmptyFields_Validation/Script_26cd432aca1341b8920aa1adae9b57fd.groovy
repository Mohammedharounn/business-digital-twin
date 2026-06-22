import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI
import static com.kms.katalon.core.testobject.ObjectRepository.findTestObject
import internal.GlobalVariable as GlobalVariable

// HTML5 'required' on email/password should block submission and keep us on /auth.
WebUI.openBrowser('')
WebUI.maximizeWindow()
WebUI.navigateToUrl(GlobalVariable.BASE_URL + '/auth')
WebUI.click(findTestObject('Auth/btn_SignIn'))
WebUI.verifyElementVisible(findTestObject('Auth/input_Email'))   // still on credentials step
WebUI.closeBrowser()
