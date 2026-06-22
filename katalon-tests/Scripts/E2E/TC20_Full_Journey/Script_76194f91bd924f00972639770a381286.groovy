import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI
import static com.kms.katalon.core.testobject.ObjectRepository.findTestObject
import internal.GlobalVariable as GlobalVariable

// Login -> open project -> Dashboard -> Marketplace search -> add -> verify -> logout
WebUI.openBrowser('')
WebUI.maximizeWindow()
CustomKeywords.'com.bdt.AuthKeywords.loginVerified'(GlobalVariable.TEST_EMAIL, GlobalVariable.TEST_PASSWORD)
CustomKeywords.'com.bdt.AuthKeywords.enterAnyProject'()
WebUI.click(findTestObject('Navigation/nav_Overview'))
WebUI.verifyElementVisible(findTestObject('Dashboard/kpi_StartupCapital'))
WebUI.click(findTestObject('Navigation/nav_Marketplace'))
WebUI.setText(findTestObject('Marketplace/input_Search'), 'Espresso Machine')
WebUI.click(findTestObject('Marketplace/btn_Search'))
WebUI.waitForElementVisible(findTestObject('Marketplace/btn_AddToBusiness_First'), GlobalVariable.DEFAULT_TIMEOUT as int)
WebUI.click(findTestObject('Marketplace/btn_AddToBusiness_First'))
WebUI.delay(2)
WebUI.click(findTestObject('Navigation/nav_Overview'))
WebUI.verifyElementVisible(findTestObject('Dashboard/kpi_StartupCapital'))
CustomKeywords.'com.bdt.AuthKeywords.logout'()
WebUI.verifyElementVisible(findTestObject('Auth/input_Email'))
WebUI.closeBrowser()
