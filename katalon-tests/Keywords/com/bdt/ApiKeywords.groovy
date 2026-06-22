package com.bdt

import com.kms.katalon.core.annotation.Keyword
import com.kms.katalon.core.testobject.RequestObject
import com.kms.katalon.core.testobject.TestObjectProperty
import com.kms.katalon.core.testobject.ConditionType
import com.kms.katalon.core.webservice.keyword.WSBuiltInKeywords as WS
import internal.GlobalVariable as GlobalVariable
import groovy.json.JsonSlurper
import groovy.json.JsonOutput

public class ApiKeywords {

    private RequestObject buildRequest(String id, String method, String url, String token, String body) {
        RequestObject req = new RequestObject(id)
        req.setRestUrl(url)
        req.setRestRequestMethod(method)
        List<TestObjectProperty> headers = new ArrayList<>()
        headers.add(new TestObjectProperty('Content-Type', ConditionType.EQUALS, 'application/json'))
        if (token != null) headers.add(new TestObjectProperty('Authorization', ConditionType.EQUALS, 'Bearer ' + token))
        req.setHttpHeaderProperties(headers)
        if (body != null) { req.setBodyContent(new com.kms.katalon.core.testobject.impl.HttpTextBodyContent(body)) }
        return req
    }

    /** Logs in a VERIFIED user via API and returns the JWT access token. */
    @Keyword
    String getAuthToken(String email, String password) {
        def body = JsonOutput.toJson([email: email, password: password])
        def req = buildRequest('login', 'POST', GlobalVariable.API_URL + '/auth/login', null, body)
        def res = WS.sendRequest(req)
        assert res.getStatusCode() == 200 : 'Login failed, status ' + res.getStatusCode()
        def json = new JsonSlurper().parseText(res.getResponseText())
        assert json.accessToken != null : 'No accessToken (is the user verified? unverified users get requiresOTP)'
        return json.accessToken
    }

    @Keyword
    def getProjects(String token) {
        def req = buildRequest('projects', 'GET', GlobalVariable.API_URL + '/business', token, null)
        def res = WS.sendRequest(req)
        assert res.getStatusCode() == 200 : 'GET /business failed: ' + res.getStatusCode()
        def json = new JsonSlurper().parseText(res.getResponseText())
        assert json.success == true
        assert json.data instanceof List : 'Expected an array of projects'
        return json
    }

    @Keyword
    def searchEbay(String token, String query) {
        def url = GlobalVariable.API_URL + '/marketplace/search?q=' + java.net.URLEncoder.encode(query, 'UTF-8') + '&limit=10'
        def req = buildRequest('ebay', 'GET', url, token, null)
        def res = WS.sendRequest(req)
        assert res.getStatusCode() == 200 : 'eBay search failed: ' + res.getStatusCode() + ' ' + res.getResponseText()
        def json = new JsonSlurper().parseText(res.getResponseText())
        assert json.success == true
        assert json.items instanceof List
        return json
    }
}
