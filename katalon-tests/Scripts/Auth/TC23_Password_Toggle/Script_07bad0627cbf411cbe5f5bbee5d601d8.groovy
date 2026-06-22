import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI
import static com.kms.katalon.core.testobject.ObjectRepository.findTestObject
import internal.GlobalVariable as GlobalVariable
WebUI.openBrowser('')
WebUI.maximizeWindow()
WebUI.navigateToUrl(GlobalVariable.BASE_URL + '/auth')
WebUI.setText(findTestObject('Auth/input_Password'), 'secret123')
String before = WebUI.getAttribute(findTestObject('Auth/input_Password'), 'type')
WebUI.click(findTestObject('Auth/btn_ShowPassword'))
WebUI.delay(1)
WebUI.comment('Password input type before toggle: ' + before)
WebUI.closeBrowser()
