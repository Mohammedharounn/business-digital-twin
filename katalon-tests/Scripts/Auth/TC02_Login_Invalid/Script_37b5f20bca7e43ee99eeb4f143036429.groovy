import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI
import static com.kms.katalon.core.testobject.ObjectRepository.findTestObject
import internal.GlobalVariable as GlobalVariable

WebUI.openBrowser('')
WebUI.maximizeWindow()
WebUI.navigateToUrl(GlobalVariable.BASE_URL + '/auth')
WebUI.setText(findTestObject('Auth/input_Email'), GlobalVariable.INVALID_EMAIL)
WebUI.setText(findTestObject('Auth/input_Password'), GlobalVariable.INVALID_PASSWORD)
WebUI.click(findTestObject('Auth/btn_SignIn'))
WebUI.waitForElementVisible(findTestObject('Auth/div_Error'), GlobalVariable.DEFAULT_TIMEOUT as int)
String err = WebUI.getText(findTestObject('Auth/div_Error'))
WebUI.verifyMatch(err, '(?i).*(invalid|password|incorrect).*', true)
WebUI.closeBrowser()
