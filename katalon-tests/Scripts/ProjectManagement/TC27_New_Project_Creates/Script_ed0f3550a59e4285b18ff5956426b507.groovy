import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI
import static com.kms.katalon.core.testobject.ObjectRepository.findTestObject
import internal.GlobalVariable as GlobalVariable
WebUI.openBrowser('')
WebUI.maximizeWindow()
CustomKeywords.'com.bdt.AuthKeywords.loginVerified'(GlobalVariable.TEST_EMAIL, GlobalVariable.TEST_PASSWORD)
WebUI.click(findTestObject('ProjectSelector/btn_NewProject'))
WebUI.delay(3)
WebUI.verifyElementNotPresent(findTestObject('ProjectSelector/btn_NewProject'), 5, com.kms.katalon.core.model.FailureHandling.OPTIONAL)
WebUI.closeBrowser()
