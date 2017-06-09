"""
Python code to upload data to Azure Search for the MLADS Bot.

This script will upload all of the session information where
each individual sesssion equates to a document in an index
in an Azure Search service.

Go to http://portal.azure.com and sign up for a search service.
Get the service name and service key and plug it in below.
This is NOT production level code. Please do not use it as such.
You might have to pip install the imported modules here.

Run this script in the 'code' directory:
    python search_mgmt.py

See Azure Search REST API docs for more info:
    https://docs.microsoft.com/en-us/rest/api/searchservice/index

"""

import requests
import json
import csv
import datetime
import pytz
import calendar
import os
import pyexcel as pe

# Index gets created
indexName = 'mladsidxer1'

# This is the service you've already created in Azure Portal
serviceName = 'mlads-search-dev'

# Other globals
apiKey = os.getenv('SEARCH_KEY_DEV', '')
apiVersion = '2016-09-01'

# Input file must be .xls (not .xlsx)
inputfile = os.path.join(os.getcwd(), '../data/MLADSBOT-AGENDA-V3.xls')

def getSampleDocumentObject():
    
    valarry = []
    cnt = 1
    records = pe.iget_records(file_name=inputfile)
    for row in records:
        
        outdict = {}
        outdict['@search.action'] = 'upload'

        if (row['Title']):
            outdict['id'] = str(cnt)
            outdict['title'] = row['Title']
            day = str(row['Day'].strftime("%d"))
            outdict['startTime'] = str(row['startTime'].strftime("%H:%M"))
            outdict['endTime'] = str(row['endTime'].strftime("%H:%M"))
            outdict['description'] = str(row['Description'])
            outdict['speakers'] = row['Speakers'].split(',')
            outdict['track'] = str(row['Track'])
            outdict['links'] = str(row['Links'])
            outdict['day'] = str(day)
            outdict['location'] = str(row['Location'])
        valarry.append(outdict)
        cnt+=1

    return {'value' : valarry}


def getSampleIndexDefinition():
    return {
        "name": indexName,  
        "fields": [
{"name": "id", "type": "Edm.String", "key": True, "retrievable": True, "searchable": False, "filterable": True, "sortable": True, "facetable": False},

        {"name": "title", "type": "Edm.String", "key": False, "retrievable": True, "searchable": True, "filterable": True, "sortable": True, "facetable": True, "filterable": True},

        {"name": "startTime", "type": "Edm.String", "retrievable": True, "searchable": False, "filterable": True, "sortable": True, "facetable": False},

        {"name": "endTime", "type": "Edm.String", "retrievable": True, "searchable": False, "filterable": True, "sortable": True, "facetable": False},

        {"name": "description", "type": "Edm.String", "retrievable": True, "searchable": True, "filterable": True, "sortable": True, "facetable": True},

        {"name": "speakers", "type": "Collection(Edm.String)", "retrievable": True, "searchable": True, "filterable": True, "sortable": False, "facetable": True},

        {"name": "track", "type": "Edm.String", "retrievable": True, "searchable": True, "filterable": True, "sortable": True, "facetable": True},

        {"name": "links", "type": "Edm.String", "retrievable": True, "searchable": True, "filterable": False, "sortable": False, "facetable": False},

        {"name": "day", "type": "Edm.String", "retrievable": True, "searchable": True, "filterable": True, "sortable": True, "facetable": True},

        {"name": "location", "type": "Edm.String", "retrievable": True, "searchable": True, "filterable": True, "sortable": True, "facetable": True}
        ]
    }

def getServiceUrl():
    return 'https://' + serviceName + '.search.windows.net'

def getMethod(servicePath):
    headers = {'Content-type': 'application/json', 'api-key': apiKey}
    r = requests.get(getServiceUrl() + servicePath, headers=headers)
    print(r.text)

def postMethod(servicePath, body):
    headers = {'Content-type': 'application/json', 'api-key': apiKey}
    r = requests.post(getServiceUrl() + servicePath, headers=headers, data=body)

def createSampleIndex():
    indexDefinition = json.dumps(getSampleIndexDefinition())  
    servicePath = '/indexes/?api-version=%s' % apiVersion
    postMethod(servicePath, indexDefinition)
    print('Sample index created.')

def getSampleIndex():
    servicePath = '/indexers/?api-version=%s' % apiVersion
    getMethod(servicePath)

def uploadSampleDocument():
    documents = json.dumps(getSampleDocumentObject())
    servicePath = '/indexes/' + indexName + '/docs/index?api-version=' + apiVersion
    postMethod(servicePath, documents)

def printDocumentCount():
    servicePath = '/indexes/' + indexName + '/docs/$count?api-version=' + apiVersion   
    getMethod(servicePath)

def sampleQuery(query):
    servicePath = '/indexes/' + indexName + '/docs?search=%s&api-version=%s' % \
        (query, apiVersion)
    getMethod(servicePath)

if __name__ == '__main__':
    createSampleIndex()
    # getSampleIndex()
    uploadSampleDocument()
    printDocumentCount()
    sampleQuery('Micheleen')