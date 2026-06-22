import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI
import static com.kms.katalon.core.testobject.ObjectRepository.findTestObject
import internal.GlobalVariable as GlobalVariable
WebUI.openBrowser('')
WebUI.maximizeWindow()
WebUI.navigateToUrl(GlobalVariable.BASE_URL + '/auth')
WebUI.setText(findTestObject('Auth/input_Email'), GlobalVariable.TEST_EMAIL)
WebUI.setText(findTestObject('Auth/input_Password'), 'DefinitelyWrong#123')
WebUI.click(findTestObject('Auth/btn_SignIn'))
WebUI.verifyElementVisible(findTestObject('Auth/div_Error'))
WebUI.closeBrowser()
