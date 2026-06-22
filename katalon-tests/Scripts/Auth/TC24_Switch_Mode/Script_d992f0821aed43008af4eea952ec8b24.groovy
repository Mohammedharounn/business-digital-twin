import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI
import static com.kms.katalon.core.testobject.ObjectRepository.findTestObject
import internal.GlobalVariable as GlobalVariable
WebUI.openBrowser('')
WebUI.maximizeWindow()
WebUI.navigateToUrl(GlobalVariable.BASE_URL + '/auth')
WebUI.click(findTestObject('Auth/btn_ToggleMode'))
WebUI.delay(1)
String h = WebUI.getText(findTestObject('Auth/h2_Heading'))
WebUI.verifyMatch(h, '(?i).*create account.*', true)
WebUI.closeBrowser()
