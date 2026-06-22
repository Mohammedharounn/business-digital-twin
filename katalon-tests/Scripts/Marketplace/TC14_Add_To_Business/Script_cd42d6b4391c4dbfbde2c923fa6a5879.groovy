import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI
import static com.kms.katalon.core.testobject.ObjectRepository.findTestObject
import internal.GlobalVariable as GlobalVariable

WebUI.openBrowser('')
WebUI.maximizeWindow()
CustomKeywords.'com.bdt.AuthKeywords.loginVerified'(GlobalVariable.TEST_EMAIL, GlobalVariable.TEST_PASSWORD)
CustomKeywords.'com.bdt.AuthKeywords.enterAnyProject'()
WebUI.click(findTestObject('Navigation/nav_Marketplace'))
WebUI.setText(findTestObject('Marketplace/input_Search'), 'Printer')
WebUI.click(findTestObject('Marketplace/btn_Search'))
WebUI.waitForElementVisible(findTestObject('Marketplace/btn_AddToBusiness_First'), GlobalVariable.DEFAULT_TIMEOUT as int)
WebUI.click(findTestObject('Marketplace/btn_AddToBusiness_First'))
WebUI.verifyElementVisible(findTestObject('Marketplace/toast'), com.kms.katalon.core.model.FailureHandling.OPTIONAL)
WebUI.closeBrowser()
