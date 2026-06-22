import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI
import static com.kms.katalon.core.testobject.ObjectRepository.findTestObject
import internal.GlobalVariable as GlobalVariable

WebUI.openBrowser('')
WebUI.maximizeWindow()
WebUI.navigateToUrl(GlobalVariable.BASE_URL + '/auth')
WebUI.setText(findTestObject('Auth/input_Email'), GlobalVariable.INVALID_EMAIL)
WebUI.setText(findTestObject('Auth/input_Password'), GlobalVariable.INVALID_PASSWORD)
WebUI.click(findTestObject('Auth/btn_SignIn'))
WebUI.verifyElementVisible(findTestObject('Auth/div_Error'), com.kms.katalon.core.model.FailureHandling.STOP_ON_FAILURE)
String err = WebUI.getText(findTestObject('Auth/div_Error'))
WebUI.verifyMatch(err, '(?i).*(invalid|password).*', true)
WebUI.closeBrowser()
