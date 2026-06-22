import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI
import static com.kms.katalon.core.testobject.ObjectRepository.findTestObject
import internal.GlobalVariable as GlobalVariable
WebUI.openBrowser('')
WebUI.maximizeWindow()
CustomKeywords.'com.bdt.AuthKeywords.loginVerified'(GlobalVariable.TEST_EMAIL, GlobalVariable.TEST_PASSWORD)
CustomKeywords.'com.bdt.AuthKeywords.enterAnyProject'()
WebUI.click(findTestObject('Navigation/nav_Marketplace'))
WebUI.click(findTestObject('Marketplace/chip_CoffeeMachine'), com.kms.katalon.core.model.FailureHandling.OPTIONAL)
WebUI.waitForElementVisible(findTestObject('Marketplace/lbl_ResultsCount'), GlobalVariable.DEFAULT_TIMEOUT as int)
WebUI.closeBrowser()
