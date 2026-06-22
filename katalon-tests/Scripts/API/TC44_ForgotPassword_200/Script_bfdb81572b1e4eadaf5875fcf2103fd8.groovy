import com.kms.katalon.core.testobject.RequestObject
import com.kms.katalon.core.testobject.TestObjectProperty
import com.kms.katalon.core.testobject.ConditionType
import com.kms.katalon.core.webservice.keyword.WSBuiltInKeywords as WS
import internal.GlobalVariable as GlobalVariable
import groovy.json.JsonOutput
RequestObject req = new RequestObject('forgot')
req.setRestUrl(GlobalVariable.API_URL + '/auth/forgot-password')
req.setRestRequestMethod('POST')
req.setHttpHeaderProperties([new TestObjectProperty('Content-Type', ConditionType.EQUALS, 'application/json')])
req.setBodyContent(new com.kms.katalon.core.testobject.impl.HttpTextBodyContent(JsonOutput.toJson([email: GlobalVariable.TEST_EMAIL])))
def res = WS.sendRequest(req)
assert res.getStatusCode() == 200 : 'forgot-password returned ' + res.getStatusCode()
println 'forgot-password OK'
