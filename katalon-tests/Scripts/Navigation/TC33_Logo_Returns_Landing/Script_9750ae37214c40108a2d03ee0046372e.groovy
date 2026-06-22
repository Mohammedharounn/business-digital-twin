import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI
import static com.kms.katalon.core.testobject.ObjectRepository.findTestObject
import internal.GlobalVariable as GlobalVariable
WebUI.openBrowser('')
WebUI.maximizeWindow()
CustomKeywords.'com.bdt.AuthKeywords.loginVerified'(GlobalVariable.TEST_EMAIL, GlobalVariable.TEST_PASSWORD)
CustomKeywords.'com.bdt.AuthKeywords.enterAnyProject'()
WebUI.click(findTestObject('Sidebar/logo_Kernel'))
WebUI.delay(2)
WebUI.verifyElementPresent(findTestObject('Sidebar/logo_Kernel'), 5, com.kms.katalon.core.model.FailureHandling.OPTIONAL)
WebUI.closeBrowser()
