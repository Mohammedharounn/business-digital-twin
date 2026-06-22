import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI
import static com.kms.katalon.core.testobject.ObjectRepository.findTestObject
import internal.GlobalVariable as GlobalVariable
WebUI.openBrowser('')
WebUI.maximizeWindow()
WebUI.navigateToUrl(GlobalVariable.BASE_URL + '/auth')
WebUI.click(findTestObject('Auth/btn_BackToHome'))
WebUI.delay(2)
WebUI.verifyElementNotPresent(findTestObject('Auth/btn_SignIn'), 5, com.kms.katalon.core.model.FailureHandling.OPTIONAL)
WebUI.closeBrowser()
