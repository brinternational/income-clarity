'use client'

import React from 'react'
import { 
  Card, 
  Grid, 
  Metric, 
  Text, 
  AreaChart, 
  BarList, 
  DonutChart,
  BadgeDelta,
  Flex,
  Title,
  Subtitle,
  ProgressBar,
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels
} from '@tremor/react'
import { 
  TrendingUp,
  DollarSign,
  Calculator,
  PieChart,
  Target
} from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'

// Sample data for demonstration - replace with real data
const portfolioData = [
  {
    date: '2024-01',
    'Portfolio': 45000,
    'SPY': 43000
  },
  {
    date: '2024-02',
    'Portfolio': 46500,
    'SPY': 44200
  },
  {
    date: '2024-03',
    'Portfolio': 48200,
    'SPY': 45800
  },
  {
    date: '2024-04',
    'Portfolio': 47800,
    'SPY': 45200
  },
  {
    date: '2024-05',
    'Portfolio': 49500,
    'SPY': 46800
  },
  {
    date: '2024-06',
    'Portfolio': 52000,
    'SPY': 48500
  }
]

const holdingsData = [
  {
    name: 'AAPL',
    value: 15420,
    delta: '+5.2%'
  },
  {
    name: 'MSFT', 
    value: 12800,
    delta: '+3.1%'
  },
  {
    name: 'GOOGL',
    value: 9650,
    delta: '+7.8%'
  },
  {
    name: 'TSLA',
    value: 8200,
    delta: '-2.3%'
  },
  {
    name: 'NVDA',
    value: 5930,
    delta: '+12.4%'
  }
]

const sectorData = [
  {
    name: 'Technology',
    value: 45,
    color: 'blue'
  },
  {
    name: 'Healthcare',
    value: 20,
    color: 'green'
  },
  {
    name: 'Finance',
    value: 15,
    color: 'yellow'
  },
  {
    name: 'Energy',
    value: 12,
    color: 'red'
  },
  {
    name: 'Consumer',
    value: 8,
    color: 'purple'
  }
]

const incomeData = [
  {
    date: '2024-01',
    'Dividends': 1200,
    'Interest': 300
  },
  {
    date: '2024-02', 
    'Dividends': 1350,
    'Interest': 320
  },
  {
    date: '2024-03',
    'Dividends': 1180,
    'Interest': 310
  },
  {
    date: '2024-04',
    'Dividends': 1420,
    'Interest': 340
  },
  {
    date: '2024-05',
    'Dividends': 1580,
    'Interest': 360
  },
  {
    date: '2024-06',
    'Dividends': 1650,
    'Interest': 380
  }
]

export function TremorSuperCardsDashboard() {
  return (
    <div className="p-6 space-y-6 relative">
      {/* Theme Toggle */}
      <ThemeToggle />
      
      {/* Header */}
      <div className="text-center">
        <Title className="text-3xl font-bold">Income Clarity Dashboard</Title>
        <Subtitle>Professional financial intelligence with real-time analytics</Subtitle>
      </div>

      {/* KPI Cards Grid */}
      <Grid numCols={1} numColsMd={2} numColsLg={4} className="gap-6">
        <Card className="max-w-xs mx-auto">
          <Flex alignItems="start">
            <div>
              <Text>Total Portfolio</Text>
              <Metric>$52,000</Metric>
            </div>
            <BadgeDelta deltaType="moderateIncrease" isIncreasePositive={true} size="xs">
              +12.3%
            </BadgeDelta>
          </Flex>
          <Flex className="mt-4">
            <Text className="truncate">vs SPY Performance</Text>
            <Text>+3.2% vs SPY</Text>
          </Flex>
          <ProgressBar value={75} color="green" className="mt-2" />
        </Card>

        <Card className="max-w-xs mx-auto">
          <Flex alignItems="start">
            <div>
              <Text>Monthly Income</Text>
              <Metric>$2,030</Metric>
            </div>
            <BadgeDelta deltaType="increase" isIncreasePositive={true} size="xs">
              +8.7%
            </BadgeDelta>
          </Flex>
          <Flex className="mt-4">
            <Text className="truncate">Annual Yield</Text>
            <Text>4.7%</Text>
          </Flex>
          <ProgressBar value={47} color="blue" className="mt-2" />
        </Card>

        <Card className="max-w-xs mx-auto">
          <Flex alignItems="start">
            <div>
              <Text>Tax Efficiency</Text>
              <Metric>91%</Metric>
            </div>
            <BadgeDelta deltaType="moderateIncrease" isIncreasePositive={true} size="xs">
              +2.1%
            </BadgeDelta>
          </Flex>
          <Flex className="mt-4">
            <Text className="truncate">Optimization Score</Text>
            <Text>Excellent</Text>
          </Flex>
          <ProgressBar value={91} color="green" className="mt-2" />
        </Card>

        <Card className="max-w-xs mx-auto">
          <Flex alignItems="start">
            <div>
              <Text>FIRE Progress</Text>
              <Metric>23%</Metric>
            </div>
            <BadgeDelta deltaType="increase" isIncreasePositive={true} size="xs">
              +5.4%
            </BadgeDelta>
          </Flex>
          <Flex className="mt-4">
            <Text className="truncate">Years to FIRE</Text>
            <Text>12.3 years</Text>
          </Flex>
          <ProgressBar value={23} color="purple" className="mt-2" />
        </Card>
      </Grid>

      {/* Tab-based Layout for Super Cards */}
      <TabGroup>
        <TabList className="mt-8">
          <Tab icon={TrendingUp}>Performance</Tab>
          <Tab icon={DollarSign}>Income</Tab>
          <Tab icon={Calculator}>Tax Strategy</Tab>
          <Tab icon={PieChart}>Portfolio</Tab>
          <Tab icon={Target}>Planning</Tab>
        </TabList>
        
        <TabPanels>
          {/* Performance Hub */}
          <TabPanel className="mt-6">
            <Grid numCols={1} numColsLg={2} className="gap-6">
              <Card>
                <Title>Portfolio vs SPY Performance</Title>
                <AreaChart
                  className="h-80 mt-4"
                  data={portfolioData}
                  index="date"
                  categories={['Portfolio', 'SPY']}
                  colors={['blue', 'gray']}
                  yAxisWidth={60}
                  showAnimation={true}
                />
              </Card>

              <Card>
                <Title>Top Holdings Performance</Title>
                <BarList data={holdingsData} className="mt-4" />
              </Card>
            </Grid>
          </TabPanel>

          {/* Income Intelligence */}
          <TabPanel className="mt-6">
            <Grid numCols={1} numColsLg={2} className="gap-6">
              <Card>
                <Title>Income Progression</Title>
                <AreaChart
                  className="h-80 mt-4"
                  data={incomeData}
                  index="date"
                  categories={['Dividends', 'Interest']}
                  colors={['green', 'blue']}
                  yAxisWidth={60}
                  showAnimation={true}
                />
              </Card>

              <Card>
                <Title>Income Sources</Title>
                <Flex className="mt-4">
                  <Text>Total Monthly</Text>
                  <Text className="font-medium text-tremor-content-strong">$2,030</Text>
                </Flex>
                <div className="mt-6 space-y-4">
                  <div>
                    <Flex>
                      <Text>Dividends</Text>
                      <Text className="font-medium">$1,650</Text>
                    </Flex>
                    <ProgressBar value={81} color="green" className="mt-2" />
                  </div>
                  <div>
                    <Flex>
                      <Text>Interest</Text>
                      <Text className="font-medium">$380</Text>
                    </Flex>
                    <ProgressBar value={19} color="blue" className="mt-2" />
                  </div>
                </div>
              </Card>
            </Grid>
          </TabPanel>

          {/* Tax Strategy */}
          <TabPanel className="mt-6">
            <Grid numCols={1} numColsLg={2} className="gap-6">
              <Card>
                <Title>Tax Efficiency Score</Title>
                <Metric className="mt-4">91%</Metric>
                <Text className="mt-2">Excellent optimization across all accounts</Text>
                <div className="mt-6 space-y-4">
                  <div>
                    <Flex>
                      <Text>Tax-Deferred</Text>
                      <Text className="font-medium">65%</Text>
                    </Flex>
                    <ProgressBar value={65} color="green" className="mt-2" />
                  </div>
                  <div>
                    <Flex>
                      <Text>Tax-Free</Text>
                      <Text className="font-medium">25%</Text>
                    </Flex>
                    <ProgressBar value={25} color="blue" className="mt-2" />
                  </div>
                  <div>
                    <Flex>
                      <Text>Taxable</Text>
                      <Text className="font-medium">10%</Text>
                    </Flex>
                    <ProgressBar value={10} color="yellow" className="mt-2" />
                  </div>
                </div>
              </Card>

              <Card>
                <Title>Tax Savings This Year</Title>
                <Metric className="mt-4">$8,420</Metric>
                <Text className="mt-2">Through strategic asset location</Text>
                <div className="mt-6">
                  <Text className="font-medium">Optimization Strategies:</Text>
                  <ul className="mt-2 space-y-2 text-sm">
                    <li>• Tax-loss harvesting: $3,200</li>
                    <li>• Asset location: $2,800</li>
                    <li>• Roth conversions: $1,920</li>
                    <li>• Municipal bonds: $500</li>
                  </ul>
                </div>
              </Card>
            </Grid>
          </TabPanel>

          {/* Portfolio Strategy */}
          <TabPanel className="mt-6">
            <Grid numCols={1} numColsLg={2} className="gap-6">
              <Card>
                <Title>Sector Allocation</Title>
                <DonutChart
                  className="h-60 mt-4"
                  data={sectorData}
                  category="value"
                  index="name"
                  colors={['blue', 'green', 'yellow', 'red', 'purple']}
                  showAnimation={true}
                />
              </Card>

              <Card>
                <Title>Rebalancing Recommendations</Title>
                <div className="mt-4 space-y-4">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <Text className="font-medium text-green-800 dark:text-green-200">
                      Portfolio is well balanced
                    </Text>
                    <Text className="text-green-600 dark:text-green-300 text-sm mt-1">
                      No rebalancing needed this month
                    </Text>
                  </div>
                  <div>
                    <Flex>
                      <Text>Target Allocation Score</Text>
                      <Text className="font-medium">94%</Text>
                    </Flex>
                    <ProgressBar value={94} color="green" className="mt-2" />
                  </div>
                  <div>
                    <Flex>
                      <Text>Risk Score</Text>
                      <Text className="font-medium">Moderate</Text>
                    </Flex>
                    <ProgressBar value={65} color="blue" className="mt-2" />
                  </div>
                </div>
              </Card>
            </Grid>
          </TabPanel>

          {/* Financial Planning */}
          <TabPanel className="mt-6">
            <Grid numCols={1} numColsLg={2} className="gap-6">
              <Card>
                <Title>FIRE Progress</Title>
                <Metric className="mt-4">23%</Metric>
                <Text className="mt-2">12.3 years to financial independence</Text>
                <div className="mt-6">
                  <ProgressBar value={23} color="purple" className="mt-2" />
                  <Flex className="mt-2">
                    <Text className="text-sm">Current</Text>
                    <Text className="text-sm">Target: $2.1M</Text>
                  </Flex>
                </div>
              </Card>

              <Card>
                <Title>Milestone Tracker</Title>
                <div className="mt-4 space-y-6">
                  <div>
                    <Flex>
                      <Text className="font-medium">Emergency Fund</Text>
                      <Text className="text-green-600">✓ Complete</Text>
                    </Flex>
                    <ProgressBar value={100} color="green" className="mt-2" />
                  </div>
                  <div>
                    <Flex>
                      <Text className="font-medium">First $100K</Text>
                      <Text className="text-green-600">✓ Complete</Text>
                    </Flex>
                    <ProgressBar value={100} color="green" className="mt-2" />
                  </div>
                  <div>
                    <Flex>
                      <Text className="font-medium">Coast FIRE</Text>
                      <Text className="text-blue-600">In Progress</Text>
                    </Flex>
                    <ProgressBar value={45} color="blue" className="mt-2" />
                  </div>
                  <div>
                    <Flex>
                      <Text className="font-medium">Lean FIRE</Text>
                      <Text className="text-gray-500">Not Started</Text>
                    </Flex>
                    <ProgressBar value={15} color="gray" className="mt-2" />
                  </div>
                </div>
              </Card>
            </Grid>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </div>
  )
}

export default TremorSuperCardsDashboard