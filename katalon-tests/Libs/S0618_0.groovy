import com.kms.katalon.core.logging.KeywordLogger
import com.kms.katalon.core.exception.StepFailedException
import com.kms.katalon.core.reporting.ReportUtil
import com.kms.katalon.core.main.TestCaseMain
import com.kms.katalon.core.testdata.TestDataColumn
import com.kms.katalon.core.testcase.TestCaseBinding
import com.kms.katalon.core.driver.internal.DriverCleanerCollector
import com.kms.katalon.core.model.FailureHandling
import com.kms.katalon.core.configuration.RunConfiguration
import static com.kms.katalon.core.testcase.TestCaseFactory.findTestCase
import static com.kms.katalon.core.testobject.ObjectRepository.findTestObject
import static com.kms.katalon.core.testdata.TestDataFactory.findTestData


import com.katalon.execution.application.ExecutionMain

Map<String, String> suiteProperties = new HashMap<String, String>();

suiteProperties.put('rerunTestFailImmediately', 'true')
suiteProperties.put('retryCount', '1')
suiteProperties.put('name', 'TS_Regression')
suiteProperties.put('description', '')
suiteProperties.put('id', 'Test Suites/TS_Regression')
 

DriverCleanerCollector.getInstance().addDriverCleaner(new com.kms.katalon.core.webui.contribution.WebUiDriverCleaner())
DriverCleanerCollector.getInstance().addDriverCleaner(new com.kms.katalon.core.mobile.contribution.MobileDriverCleaner())
DriverCleanerCollector.getInstance().addDriverCleaner(new com.kms.katalon.core.cucumber.keyword.internal.CucumberDriverCleaner())
DriverCleanerCollector.getInstance().addDriverCleaner(new com.kms.katalon.core.windows.keyword.contribution.WindowsDriverCleaner())
DriverCleanerCollector.getInstance().addDriverCleaner(new com.kms.katalon.core.testng.keyword.internal.TestNGDriverCleaner())



RunConfiguration.setExecutionSettingFile("C:\\Users\\Ideapad\\Desktop\\Kher 6\\Grad 2\\NEW Digital twin99\\NEW Digital twin99\\NEW Digital twin22\\NEW Digital twin\\katalon-tests\\Reports\\20260618_235538\\TS_Regression\\20260618_235540\\execution.properties")

TestCaseMain.beforeStart()

new ExecutionMain().init();

TestCaseMain.startTestSuite('Test Suites/TS_Regression', suiteProperties, new File("C:\\Users\\Ideapad\\Desktop\\Kher 6\\Grad 2\\NEW Digital twin99\\NEW Digital twin99\\NEW Digital twin22\\NEW Digital twin\\katalon-tests\\Reports\\20260618_235538\\TS_Regression\\20260618_235540\\testCaseBinding"))
