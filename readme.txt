# setup
nvm use
npm install
node main.js

# query combined people/assessments, sort on assessment values
curl -XPOST 'http://localhost:9200/same-document/person/_search?pretty' -d '{
  "sort": [
    {
      "assessment_count": "desc",
      "assessments.rank": "desc"
    }
  ]
}'

# create index for nested
curl -XPUT 'http://localhost:9200/parent-child/' -d '
{
  "mappings": {
    "person": {},
    "assessment": {
      "_parent": {
        "type": "person"
      }
    }
  }
}'

# query nested documents directly
curl -XGET 'http://localhost:9200/parent-child/assessment/_search?pretty'
curl -XGET 'http://localhost:9200/parent-child/person/_search?pretty'

# todo...

# find people with assesssments
curl -XPOST 'http://localhost:9200/parent-child/person/_search?pretty' -d '
{
  "query": {
    "has_child": {
      "type": "assessment",
      "query": {
      }
    }
  }
}'


