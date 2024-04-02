import { Row, Typography } from "antd";

import { formatterUSD } from "../utils";
import { useEffect, useState } from "react";
import config from "../config";

const { Text } = Typography;

const OverdueSalesStats = () => {

    const [subTotal, setSubTotal] = useState('');
    const [taxTotal, setTaxTotal] = useState('');
    const [total, setTotal] = useState('');

    useEffect(() => {
        (async () => {
            try {
                const resp = await fetch(`${config.apiUrl}/sales_stats`, {
                    method: "GET",
                });

                const body = await resp.json();

                setSubTotal(formatterUSD.format(body.stats.subTotal));
                setTaxTotal(formatterUSD.format(body.stats.taxTotal));
                setTotal(formatterUSD.format(body.stats.total));
                } catch (error) {
                console.error("--------query sales_stats error", error);
                }
          })();
    }, [])

    return (
        <>
            <Row>
                <Text style={{marginBottom: "20px"}}>All Orders</Text>
            </Row>
            <Row>
                <Text>Sub Total: <Text strong>{subTotal}</Text></Text>
            </Row>
            <Row>
                <Text>Tax Total: <Text strong>{taxTotal}</Text></Text>
            </Row>
            <Row>
                <Text>Total: <Text strong>{total}</Text></Text>
            </Row>
        </>
    )
}

export default OverdueSalesStats;
